import { Content } from "@/content";
import { TomasError } from "@tomasjs/core/errors";
import { HttpHeader, HttpHeaders, PlainHttpHeaders } from "@tomasjs/core/http";
import { ServerResponse } from "http";

export interface IResponseWriter {
  get sent(): boolean;
  withHeaders(headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null): this;
  withStatus(status: number | null): this;
  withContent(content: Content<unknown> | null): this;
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

  withHeaders(headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    this.headers = headers;
    return this;
  }

  withStatus(status: number | null): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    this.status = status;
    return this;
  }

  withContent(content: Content<unknown> | null): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    this.content = content;
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

  private setHeaders(headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    if (headers === null) {
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

  private setStatus(status: number | null): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    if (status === null) {
      return this;
    }

    this.res.statusMessage = undefined!; // Set to undefined to prevent overwriting the returned status
    this.res.statusCode = status;
    return this;
  }

  private setContent(content: Content<unknown> | null): this {
    if (this._sent) {
      throw new ResponseAlreadySentError();
    }

    if (content === null) {
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
