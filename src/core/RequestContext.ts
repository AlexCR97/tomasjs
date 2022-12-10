import { Request, request } from "express";

export class RequestContext {
  readonly path!: typeof request.path;
  readonly headers!: typeof request.headers;
  readonly params!: typeof request.params;
  readonly query!: typeof request.query;
  readonly body?: typeof request.body;

  constructor(req: Request) {
    this.path = req.path;
    this.headers = req.headers;
    this.params = req.params;
    this.query = req.query;
    this.body = req.body;
  }

  getBody<T>(): T {
    return this.body as T;
  }
}
