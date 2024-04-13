import { Content } from "@/content";
import { HttpHeader, HttpHeaders, PlainHttpHeaders } from "@tomasjs/core/http";

export class EndpointResponse {
  readonly status: number | null;
  readonly content: Content<unknown> | null;
  readonly headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null;

  constructor(options?: EndpointResponseOptions) {
    this.status = options?.status ?? null;
    this.content = options?.content ?? null;
    this.headers = options?.headers ?? null;
  }
}

export type EndpointResponseOptions = {
  status?: number;
  content?: Content<unknown>;
  headers?: HttpHeader[] | PlainHttpHeaders | HttpHeaders;
};
