import { NextFunction } from "express";
import { HttpContext, statusCodes } from "@/core";
import { JsonResponse } from "@/responses";
import { ErrorHandler } from "./ErrorHandler";
import { StatusCodeError } from "@/errors";
import { injectable } from "@tomasjs/core";

// TODO Update json response to meet industry standards

@injectable()
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
            status: statusCodes.internalServerError,
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          {
            status: statusCodes.internalServerError,
          }
        )
      );
    }

    return next(error);
  }
}
