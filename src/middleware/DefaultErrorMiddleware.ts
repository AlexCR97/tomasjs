import { HttpContext } from "@/core";
import { StatusCodeError } from "@/core/errors";
import { JsonResponse } from "@/responses";
import { NextFunction } from "express";
import { ErrorMiddleware } from "./ErrorMiddleware";

export class DefaultErrorMiddleware extends ErrorMiddleware {
  handle<TError = any>(
    err: TError,
    context: HttpContext,
    next: NextFunction
  ): void | Promise<void> {
    if (err instanceof StatusCodeError) {
      return context.respond(
        new JsonResponse(
          {
            status: err.status,
            message: err.message,
          },
          {
            status: err.status,
          }
        )
      );
    }

    return next(err);
  }
}