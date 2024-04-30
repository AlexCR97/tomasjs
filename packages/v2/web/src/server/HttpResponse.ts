import { Content } from "@/content";
import { HttpHeader, PlainHttpHeaders, HttpHeaders } from "@tomasjs/core/http";

export class HttpResponse {
  readonly status: number | undefined;
  readonly content: Content<unknown> | undefined;
  readonly headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | undefined;

  constructor(options?: HttpResponseOptions) {
    this.status = options?.status;
    this.content = options?.content;
    this.headers = options?.headers;
  }
}

export type HttpResponseOptions = {
  status?: number;
  content?: Content<unknown>;
  headers?: HttpHeader[] | PlainHttpHeaders | HttpHeaders;
};
