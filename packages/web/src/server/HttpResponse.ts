import { HttpHeader, PlainHttpHeaders, HttpHeaders, IHttpContent } from "@tomasjs/core/http";

export class HttpResponse {
  readonly status: number | undefined;
  readonly content: IHttpContent<unknown> | undefined;
  readonly headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | undefined;

  constructor(options?: HttpResponseOptions) {
    this.status = options?.status;
    this.content = options?.content;
    this.headers = options?.headers;
  }
}

export type HttpResponseOptions = {
  status?: number;
  content?: IHttpContent<unknown>;
  headers?: HttpHeader[] | PlainHttpHeaders | HttpHeaders;
};
