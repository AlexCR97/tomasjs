import { singleton } from "tsyringe";
import { request } from "express";

@singleton()
export class RequestContext {
  readonly headers!: typeof request.headers;
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
