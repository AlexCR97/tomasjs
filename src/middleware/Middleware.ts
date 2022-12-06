import { HttpContext } from "@/core";
import { NextFunction, Request, Response } from "express";

// TODO Deprecate this and use ThomasMiddleware
export abstract class Middleware<T = any> {
  abstract handle(req: Request, res: Response, next: NextFunction): T | Promise<T>;
}

export abstract class ThomasMiddleware {
  abstract handle<TResult = any>(
    context: HttpContext,
    next: NextFunction
  ): TResult | Promise<TResult>;
}
