import { Request, Response, NextFunction } from "express";
import { Middleware } from "./Middleware";
import { MiddlewareHandler } from "./types";

export class AnonymousMiddleware extends Middleware {
  constructor(private readonly handler: MiddlewareHandler) {
    super();
  }

  handle(req: Request, res: Response, next: NextFunction): void {
    this.handler(req, res, next);
  }
}
