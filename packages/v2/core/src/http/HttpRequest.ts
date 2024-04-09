import { HttpHeaders, PlainHttpHeaders } from "./HttpHeaders";
import { merge } from "@/system";
import { InvalidOperationError } from "@/errors";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options";

export type HttpBody = NonNullable<fetchRequestInit["body"]>;
type fetchRequestInit = NonNullable<fetchParams[1]>;
type fetchParams = Parameters<typeof fetch>;

export type PlainHttpRequest = {
  method: HttpMethod;
  url: string;
  headers?: PlainHttpHeaders;
  body?: HttpBody;
};

export class HttpRequest {
  private _method: HttpMethod;
  private _url: string | undefined;
  private _body: HttpBody | undefined;
  private readonly _headers: PlainHttpHeaders[] = [];

  constructor(method: HttpMethod) {
    this._method = method;
  }

  static fromPlain(request: PlainHttpRequest): HttpRequest {
    const httpRequest = new HttpRequest(request.method).withUrl(request.url);

    if (request.headers !== undefined) {
      httpRequest.withHeaders(request.headers);
    }

    if (request.body !== undefined) {
      httpRequest.withBody(request.body);
    }

    return httpRequest;
  }

  withUrl(url: string): HttpRequest {
    this._url = url;
    return this;
  }

  withHeaders(headers: PlainHttpHeaders): HttpRequest;
  withHeaders(headers: HttpHeaders): HttpRequest;
  withHeaders(builder: (headers: HttpHeaders) => void): HttpRequest;
  withHeaders(...args: any[]): HttpRequest {
    if (typeof args[0] === "function") {
      const [builder] = args;
      const headers = new HttpHeaders();
      builder(headers);
      return this.addHeaders(headers.toPlain());
    }

    if (args[0] instanceof HttpHeaders) {
      const [httpHeaders] = args;
      return this.addHeaders(httpHeaders.toPlain());
    }

    if (typeof args[0] === "object") {
      const [plainHeaders] = args;
      return this.addHeaders(plainHeaders);
    }

    throw new InvalidOperationError();
  }

  private addHeaders(headers: PlainHttpHeaders): HttpRequest {
    this._headers.push(headers);
    return this;
  }

  withBody(body: HttpBody): HttpRequest {
    this._body = body;
    return this;
  }

  toPlain(): PlainHttpRequest {
    return {
      method: this._method,
      url: this._url ?? "/",
      body: this._body,
      headers: merge(this._headers),
    };
  }
}
