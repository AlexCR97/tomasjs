import { Content } from "@/content";
import { TomasError } from "@tomasjs/core/errors";
import { HttpHeader, HttpHeaders, PlainHttpHeaders } from "@tomasjs/core/http";
import { ServerResponse } from "http";

export interface IResponseWriter {
  get sent(): boolean;
  withHeaders(headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null | undefined): this;
  withStatus(status: number | null | undefined): this;
  withContent(content: Content<unknown> | null | undefined): this;
  send(): Promise<void>;
}

export class ResponseWriter implements IResponseWriter {
  private _sent = false;
  private content: Content<unknown> | null = null;
  private headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null = null;
  private status: number | null = null;

  constructor(private readonly res: ServerResponse) {}

  get sent(): boolean {
    return this._sent;
  }

  withHeaders(headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null | undefined): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    this.headers = headers ?? null;
    return this;
  }

  withStatus(status: number | null | undefined): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    this.status = status ?? null;
    return this;
  }

  withContent(content: Content<unknown> | null | undefined): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    this.content = content ?? null;
    return this;
  }

  send(): Promise<void> {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    return new Promise<void>((resolve, reject) => {
      try {
        // IMPORTANT: Order matters!
        this.setHeaders(this.headers);
        this.setStatus(this.status);
        this.setContent(this.content);
        return this.res.end(() => {
          this._sent = true;
          return resolve();
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  private setHeaders(
    headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null | undefined
  ): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    if (headers === null || headers === undefined) {
      return this;
    }

    if (headers instanceof HttpHeaders) {
      return this.setHeadersPlain(headers.toPlain());
    }

    if (Array.isArray(headers)) {
      return this.setHeadersArray(headers);
    }

    return this.setHeadersPlain(headers);
  }

  private setHeadersPlain(headers: PlainHttpHeaders): this {
    const headersArray: HttpHeader[] = Object.keys(headers).map((key) => ({
      key,
      value: headers[key],
    }));

    return this.setHeadersArray(headersArray);
  }

  private setHeadersArray(headers: HttpHeader[]): this {
    for (const header of headers) {
      this.res.setHeader(header.key, header.value);
    }

    return this;
  }

  private setStatus(status: number | null | undefined): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    if (status === null || status === undefined) {
      return this;
    }

    this.res.statusMessage = undefined!; // Set to undefined to prevent overwriting the returned status
    this.res.statusCode = status;
    return this;
  }

  private setContent(content: Content<unknown> | null | undefined): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    if (content === null || content === undefined) {
      return this;
    }

    this.withHeaders({ "content-type": content.type });
    this.res.write(content.data);
    return this;
  }
}

export class ResponseAlreadySentError extends TomasError {
  constructor() {
    super("web/ResponseAlreadySent", `The response has already been sent`);
  }
}
