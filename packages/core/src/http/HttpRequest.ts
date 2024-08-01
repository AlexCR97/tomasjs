import { TomasError } from "@/errors";
import { IHttpContent } from "./HttpContent";
import {
  HttpHeaders,
  IHttpHeaders,
  isIHttpHeaders,
  isPlainHttpHeaders,
  PlainHttpHeaders,
} from "./HttpHeaders";
import { HttpMethod } from "./HttpMethod";

export interface IHttpRequest<T> {
  readonly method: HttpMethod;
  readonly url: string;
  readonly headers?: IHttpHeaders;
  readonly body?: IHttpContent<T>;
  toString(): string;
}

export class HttpRequest<T> implements IHttpRequest<T> {
  constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly headers: IHttpHeaders | undefined,
    readonly body: IHttpContent<T> | undefined
  ) {}

  toString(): string {
    const normalizedUrl = this.url.trim().length === 0 ? "/" : this.url;
    const lines = [`${this.method} ${normalizedUrl}`];

    if (this.headers) {
      const plainHeaders = this.headers.toPlain();

      for (const key in plainHeaders) {
        const value = plainHeaders[key];
        lines.push(`${key}: ${value}`);
      }
    }

    if (this.body && this.body.data.length > 0) {
      lines.push(`\n${this.body.toString()}`);
    }

    return lines.join("\n");
  }

  static builder<T>(): IHttpRequestBuilder<T> {
    return new HttpRequestBuilder<T>();
  }
}

export interface IHttpRequestBuilder<T> {
  withMethod(method: HttpMethod): this;
  withUrl(url: string): this;
  withHeaders(headers: IHttpHeaders | PlainHttpHeaders): this;
  withBody(body: IHttpContent<T>): this;
  build(): IHttpRequest<T>;
}

class HttpRequestBuilder<T> implements IHttpRequestBuilder<T> {
  private method: HttpMethod = "GET";
  private url: string = "/";
  private headers: IHttpHeaders = new HttpHeaders();
  private body: IHttpContent<T> | undefined;

  withMethod(method: HttpMethod): this {
    this.method = method;
    return this;
  }

  withUrl(url: string): this {
    this.url = url;
    return this;
  }

  withHeaders(headers: IHttpHeaders | PlainHttpHeaders): this {
    if (isIHttpHeaders(headers)) {
      this.headers.add(headers.toPlain());
    } else if (isPlainHttpHeaders(headers)) {
      this.headers.add(headers);
    }

    return this;
  }

  withBody(body: IHttpContent<T>): this {
    this.body = body;
    return this;
  }

  build(): HttpRequest<T> {
    return new HttpRequest<T>(this.method, this.url, this.headers, this.body);
  }
}

export class HttpRequestError<T> extends TomasError {
  private constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly headers: IHttpHeaders | undefined,
    readonly body: IHttpContent<T> | undefined,
    reason: Error | string | unknown | undefined
  ) {
    let message: string;

    if (reason instanceof Error) {
      message = `HTTP request ${method} ${url} failed: ${reason.message}`;
    } else if (typeof reason === "string") {
      message = `HTTP request ${method} ${url} failed: ${reason}`;
    } else if (reason !== undefined && reason !== null) {
      message = `HTTP request ${method} ${url} failed: ${reason}`;
    } else {
      message = `HTTP request ${method} ${url} failed`;
    }

    super("core/http/request", message);
  }

  static from<T>(request: IHttpRequest<T>, err: unknown): HttpRequestError<T> {
    if (err instanceof Error) {
      return new HttpRequestError<T>(
        request.method,
        request.url,
        request.headers,
        request.body,
        err
      );
    }

    return new HttpRequestError<T>(request.method, request.url, request.headers, request.body, err);
  }
}
