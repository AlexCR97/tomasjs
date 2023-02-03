import { NextFunction } from "express";
import { singleton } from "@/container";
import { HttpContext, StatusCodes } from "@/core";
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

    if (error instanceof Error) {
      return context.respond(
        new JsonResponse(
          {
            status: StatusCodes.internalServerError,
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          {
            status: StatusCodes.internalServerError,
          }
        )
      );
    }

    return next(error);
  }
}
