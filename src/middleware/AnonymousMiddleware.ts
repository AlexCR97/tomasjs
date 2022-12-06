import { Request, Response, NextFunction } from "express";
import { Middleware } from "./Middleware";
import { MiddlewareHandler } from "./types";

export class AnonymousMiddleware<T = any> extends Middleware<T> {
  constructor(private readonly handler: MiddlewareHandler<T>) {
    super();
  }

  handle(req: Request, res: Response, next: NextFunction): T | Promise<T> {
    return this.handler(req, res, next);
  }
}
