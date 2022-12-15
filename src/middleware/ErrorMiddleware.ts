import { HttpContext } from "@/core";
import { NextFunction } from "express";

export abstract class ErrorMiddleware {
  abstract handle<TError = any>(
    err: TError,
    context: HttpContext,
    next: NextFunction
  ): void | Promise<void>;
}
