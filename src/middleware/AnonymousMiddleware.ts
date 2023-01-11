import { HttpContext } from "@/core";
import { NextFunction } from "express";
import { Middleware } from "./Middleware";
import { MiddlewareHandler } from "./MiddlewareHandler";

export class AnonymousMiddleware implements Middleware {
  constructor(private readonly handler: MiddlewareHandler) {}
  handle(context: HttpContext, next: NextFunction): void | Promise<void> {
    return this.handler(context, next);
  }
}
