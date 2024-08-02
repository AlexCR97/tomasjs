import { InvalidCastError } from "@tomasjs/core/errors";
import { IncomingMessage } from "http";

export abstract class RequestBody<T> {
  constructor(protected readonly buffer: Buffer) {}

  abstract readContent(): T;

  asJson<T extends Record<string, any>>(): JsonBody<T> {
    if (this instanceof JsonBody) {
      return this;
    }

    throw new InvalidCastError(RequestBody.name, JsonBody.name);
  }

  asPlainText(): PlainTextBody {
    if (this instanceof PlainTextBody) {
      return this;
    }

    throw new InvalidCastError(RequestBody.name, PlainTextBody.name);
  }

  asRaw(): RawBody {
    if (this instanceof RawBody) {
      return this;
    }

    throw new InvalidCastError(RequestBody.name, RawBody.name);
  }

  static async from(req: IncomingMessage): Promise<RequestBody<unknown>> {
    const buffer = await this.readData(req);

    if (req.headers["content-type"] === "application/json") {
      return new JsonBody(buffer);
    }

    if (req.headers["content-type"] === "multipart/form-data") {
      // TODO Implement multipart/form-data
    }

    if (req.headers["content-type"] === "text/plain") {
      return new PlainTextBody(buffer);
    }

    return new RawBody(buffer);
  }

  private static async readData(req: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve) => {
      const parts: Uint8Array[] = [];

      req.on("data", (bytes: Uint8Array) => {
        parts.push(bytes);
      });

      req.on("end", () => {
        const buffer = Buffer.concat(parts);
        return resolve(buffer);
      });
    });
  }
}

export class JsonBody<T extends Record<string, any>> extends RequestBody<T> {
  readContent(): T {
    const json = this.buffer.toString();
    return JSON.parse(json);
  }
}

export class PlainTextBody extends RequestBody<string> {
  readContent(): string {
    return this.buffer.toString();
  }
}

export class RawBody extends RequestBody<Buffer> {
  readContent(): Buffer {
    return this.buffer;
  }
}
