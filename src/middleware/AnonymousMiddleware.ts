import { HttpContext } from "@/core";
import { NextFunction } from "express";
import { Middleware } from "./Middleware";
import { MiddlewareHandler } from "./MiddlewareHandler";

export class AnonymousMiddleware extends Middleware {
  constructor(private readonly handler: MiddlewareHandler) {
    super();
  }
  handle(context: HttpContext, next: NextFunction): void | Promise<void> {
    return this.handler(context, next);
  }
}
