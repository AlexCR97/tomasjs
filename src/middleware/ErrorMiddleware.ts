import { HttpContext } from "@/core";
import { NextFunction } from "express";

export interface ErrorMiddleware {
  handle<TError = any>(err: TError, context: HttpContext, next: NextFunction): void | Promise<void>;
}
