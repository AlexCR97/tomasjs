import { HttpContext } from "@/core";
import { NextFunction } from "express";
import { ErrorMiddleware } from "./ErrorMiddleware";
import { ErrorMiddlewareHandler } from "./ErrorMiddlewareHandler";

export class AnonymousErrorMiddleware implements ErrorMiddleware {
  constructor(private readonly handler: ErrorMiddlewareHandler) {}
  handle<TError = any>(
    err: TError,
    context: HttpContext,
    next: NextFunction
  ): void | Promise<void> {
    return this.handler(err, context, next);
  }
}
