import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Middleware } from "./Middleware";
import { MiddlewareHandler } from "./types";

export class AnonymousMiddleware extends Middleware {
  constructor(private readonly handler: MiddlewareHandler) {
    super();
  }

  handle(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): void {
    this.handler(req, res, next);
  }
}
