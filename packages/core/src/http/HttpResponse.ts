import { TomasError } from "@/errors";
import { IHttpContent } from "./HttpContent";
import { PlainHttpHeaders } from "./HttpHeaders";
import { HttpMethod } from "./HttpMethod";

export type IHttpResponse<T> = {
  readonly httpVersion: string;
  readonly method: HttpMethod;
  readonly url: string;
  readonly headers: PlainHttpHeaders;
  readonly status: number;
  readonly statusText: string;
  readonly isSuccess: boolean;
  readonly isClientError: boolean;
  readonly isServerError: boolean;
  readonly body: IHttpContent<T>;
  throwIfError(): void;
  toString(): string;
};

export class HttpResponse<T> implements IHttpResponse<T> {
  constructor(
    readonly httpVersion: string,
    readonly method: HttpMethod,
    readonly url: string,
    readonly headers: PlainHttpHeaders,
    readonly status: number,
    readonly statusText: string,
    readonly body: IHttpContent<T>
  ) {}

  get isSuccess(): boolean {
    return this.status >= 200 && this.status <= 299;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status <= 499;
  }

  get isServerError(): boolean {
    return this.status >= 500 && this.status <= 599;
  }

  throwIfError(): void {
    if (this.isClientError || this.isServerError) {
      throw HttpResponseError.fromResponse(this);
    }
  }

  toString(): string {
    const lines = [`HTTP/${this.httpVersion} ${this.status} ${this.statusText}`];

    for (const key in this.headers) {
      const value = this.headers[key];
      lines.push(`${key}: ${value}`);
    }

    if (this.body.data.length > 0) {
      lines.push(`\n${this.body.toString()}`);
    }

    return lines.join("\n");
  }
}

export class HttpResponseError<T> extends TomasError {
  private constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly headers: PlainHttpHeaders,
    readonly status: number,
    readonly statusText: string,
    readonly body: IHttpContent<T>,
    reason: string | undefined
  ) {
    const message = reason ? reason : `HTTP request ${method} ${url} responded with ${status}`;
    super("core/http/response", message);
  }

  static fromResponse<T>(response: IHttpResponse<T>): HttpResponseError<T> {
    return new HttpResponseError<T>(
      response.method,
      response.url,
      response.headers,
      response.status,
      response.statusText,
      response.body,
      undefined
    );
  }
}
