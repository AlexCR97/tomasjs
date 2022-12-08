import { NextFunction } from "express";
import { HttpContext, StatusCodes } from "../../../src/core";
import { ThomasMiddleware } from "../../../src/middleware";
import { JsonResponse } from "../../../src/responses";
import { environment } from "../environment";

export class ClaimMiddleware extends ThomasMiddleware {
  async handle(context: HttpContext, next: NextFunction): Promise<void> {
    const roleClaim = context.user?.claims?.role;

    if (roleClaim != environment.auth.claims.role) {
      return context.respond(
        new JsonResponse({ message: "User is not authorized" }, { status: StatusCodes.forbidden })
      );
    }

    return next();
  }
}
