import { HttpHeader, HttpHeaders, PlainHttpHeaders } from "@tomasjs/core/http";

export class EndpointResponse {
  readonly status: number | null;
  readonly content: ResponseContent<unknown> | null;
  readonly headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null;

  constructor(options?: EndpointResponseOptions) {
    this.status = options?.status ?? null;
    this.content = options?.content ?? null;
    this.headers = options?.headers ?? null;
  }
}

export type EndpointResponseOptions = {
  status?: number;
  content?: ResponseContent<unknown>;
  headers?: HttpHeader[] | PlainHttpHeaders | HttpHeaders;
};

export abstract class ResponseContent<T> {
  abstract readonly contentType: string;

  constructor(readonly data: T) {}

  abstract readContent(): string | Buffer | Uint8Array;
}