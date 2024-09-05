import { ErrorOptions, TomasError } from "@/errors";

export const HTTP_CONTENT_TYPES = [
  "application/EDI-X12",
  "application/EDIFACT",
  "application/javascript",
  "application/octet-stream",
  "application/ogg",
  "application/pdf",
  "application/xhtml+xml",
  "application/x-shockwave-flash",
  "application/json",
  "application/ld+json",
  "application/xml",
  "application/zip",
  "application/x-www-form-urlencoded",
  "application/problem+json",

  "audio/mpeg",
  "audio/x-ms-wma",
  "audio/vnd.rn-realaudio",
  "audio/x-wav",

  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/x-icon",
  "image/vnd.djvu",
  "image/svg+xml",

  "multipart/mixed",
  "multipart/alternative",
  "multipart/related",
  "multipart/form-data",

  "text/css",
  "text/csv",
  "text/html",
  "text/plain",
  "text/xml",

  "video/mpeg",
  "video/mp4",
  "video/quicktime",
  "video/x-ms-wmv",
  "video/x-msvideo",
  "video/x-flv",
  "video/webm",

  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.oasis.opendocument.graphics",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.mozilla.xul+xml",
] as const;

export type HttpContentType = (typeof HTTP_CONTENT_TYPES)[number] | (string & {});

export interface IHttpContent<T> {
  readonly type: HttpContentType;
  readonly data: Buffer;
  readData(): T;
  readJson<TJson extends JsonRecord>(): TJson;
  readText(): string;
  toString(): string;
}

export class RawContent implements IHttpContent<Buffer> {
  constructor(readonly type: HttpContentType, readonly data: Buffer) {}

  readData(): Buffer {
    return this.data;
  }

  readJson<TJson extends JsonRecord>(): TJson {
    try {
      const json = this.readText();
      return JSON.parse(json);
    } catch (err) {
      throw new JsonContentError(this, { innerError: err });
    }
  }

  readText(): string {
    return this.data.toString();
  }

  toString(): string {
    return this.readText();
  }
}

export class PlainTextContent implements IHttpContent<string> {
  readonly type: HttpContentType = "text/plain";

  constructor(readonly data: Buffer) {}

  readData(): string {
    return this.data.toString();
  }

  readJson<TJson extends JsonRecord>(): TJson {
    try {
      const json = this.readData();
      return JSON.parse(json);
    } catch (err) {
      throw new JsonContentError(this, { innerError: err });
    }
  }

  readText(): string {
    return this.readData();
  }

  toString(): string {
    return this.readData();
  }

  static from(text: string): PlainTextContent {
    const data = Buffer.from(text, "utf-8");
    return new PlainTextContent(data);
  }
}

export class HtmlContent implements IHttpContent<string> {
  readonly type: HttpContentType = "text/html";

  constructor(readonly data: Buffer) {}

  readData(): string {
    return this.data.toString();
  }

  readJson<TJson extends JsonRecord>(): TJson {
    throw new JsonContentError(this);
  }

  readText(): string {
    return this.readData();
  }

  toString(): string {
    return this.readData();
  }

  static from(html: string): HtmlContent {
    const data = Buffer.from(html, "utf-8");
    return new HtmlContent(data);
  }
}

export class JsonContent<T extends JsonRecord> implements IHttpContent<T> {
  readonly type: HttpContentType = "application/json";

  constructor(readonly data: Buffer) {}

  readData(): T {
    const json = this.data.toString();
    return JSON.parse(json);
  }

  readJson<TJson extends JsonRecord>(): TJson {
    const json = this.data.toString();
    return JSON.parse(json);
  }

  readText(): string {
    return this.toString();
  }

  toString(): string {
    const obj = this.readData();
    return JSON.stringify(obj, undefined, 2);
  }

  static from<T extends JsonRecord>(json: T): JsonContent<T> {
    const jsonStr = JSON.stringify(json);
    const data = Buffer.from(jsonStr);
    return new JsonContent(data);
  }
}

export type JsonRecord = Record<string, any>;

export function isJsonContent<T extends JsonRecord>(obj: unknown): obj is JsonContent<T> {
  return obj instanceof JsonContent;
}

export interface IHttpContentFactory {
  from(contentType: HttpContentType, data: Buffer): IHttpContent<unknown>;
}

export const HttpContentFactory: IHttpContentFactory = {
  from(contentType: HttpContentType, data: Buffer): IHttpContent<unknown> {
    if (contentType.includes("text/plain")) {
      return new PlainTextContent(data);
    }

    if (contentType.includes("text/html")) {
      return new HtmlContent(data);
    }

    if (contentType.includes("application/json")) {
      return new JsonContent(data);
    }

    return new RawContent(contentType, data);
  },
} as const;

export class JsonContentError<T> extends TomasError {
  constructor(readonly content: IHttpContent<T>, options?: ErrorOptions) {
    super(
      "core/http/JsonContent",
      `Content of type ${content.type} cannot be converted into JSON`,
      options
    );
  }
}
