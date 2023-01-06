import { NextFunction } from "express";
import { singleton } from "@/container";
import { HttpContext } from "@/core";
import { StatusCodeError } from "@/core/errors";
import { JsonResponse } from "@/responses";
import { ErrorHandler } from "./ErrorHandler";

@singleton()
export class TomasErrorHandler implements ErrorHandler {
  catch(error: any, context: HttpContext, next: NextFunction) {
    if (error instanceof StatusCodeError) {
      return context.respond(
        new JsonResponse(
          {
            status: error.status,
            message: error.message,
          },
          {
            status: error.status,
          }
        )
      );
    }

    return next(error);
  }
}
