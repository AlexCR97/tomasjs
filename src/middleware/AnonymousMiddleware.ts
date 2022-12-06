import { HttpContext } from "@/core";
import { Request, Response, NextFunction } from "express";
import { Middleware, ThomasMiddleware } from "./Middleware";
import { MiddlewareHandler, ThomasMiddlewareHandler } from "./types";

// TODO Deprecate this and use ThomasAnonymousMiddleware
export class AnonymousMiddleware<T = any> extends Middleware<T> {
  constructor(private readonly handler: MiddlewareHandler<T>) {
    super();
  }

  handle(req: Request, res: Response, next: NextFunction): T | Promise<T> {
    return this.handler(req, res, next);
  }
}

export class ThomasAnonymousMiddleware<TResult = any> extends ThomasMiddleware {
  constructor(private readonly handler: ThomasMiddlewareHandler<TResult>) {
    super();
  }
  handle<TResult>(context: HttpContext, next: NextFunction): TResult | Promise<TResult> {
    return this.handler(context, next) as any; // TODO Fix generic and remove "any"?
  }
}
