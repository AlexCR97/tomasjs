import { request } from "express";

export class RequestContext {
  readonly path!: typeof request.path;
  readonly headers!: typeof request.headers;
  readonly params!: typeof request.params;
  readonly query!: typeof request.query;
  readonly body?: typeof request.body;

  getBody<T>(): T {
    return this.body as T;
  }

  getQuery<T>(): T {
    return this.query as T;
  }

  getQueryParam<T>(key: string): T {
    return this.query[key] as T;
  }
}
