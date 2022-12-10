import { HttpContext } from "@/core";
import { NextFunction, Request, Response } from "express";

// TODO Deprecate this and use ThomasErrorMiddleware
export abstract class ErrorMiddleware {
  abstract handle(err: any, req: Request, res: Response, next: NextFunction): void; // TODO Add support for async?
}

export abstract class ThomasErrorMiddleware {
  abstract handle<TError = any, TResult = any>(
    err: TError,
    context: HttpContext,
    next: NextFunction
  ): TResult | Promise<TResult>;
}
