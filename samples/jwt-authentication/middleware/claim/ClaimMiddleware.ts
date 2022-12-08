import { NextFunction } from "express";
import { HttpContext, StatusCodes } from "../../../../src/core";
import { ThomasMiddleware } from "../../../../src/middleware";
import { JsonResponse } from "../../../../src/responses";
import { ClaimMiddlewareOptions } from "./ClaimMiddlewareOptions";

export class ClaimMiddleware extends ThomasMiddleware {
  constructor(private readonly options: ClaimMiddlewareOptions) {
    super();
  }
  async handle(context: HttpContext, next: NextFunction): Promise<void> {
    const claims = context.user?.claims;

    if (claims === undefined) {
      return context.respond(this.unauthorizedResponse);
    }

    const foundClaim = claims[this.options.claimType];

    if (foundClaim != this.options.claimValue) {
      return context.respond(this.unauthorizedResponse);
    }

    return next();
  }

  private get unauthorizedResponse() {
    return new JsonResponse(
      { message: "User is not authorized" },
      { status: StatusCodes.forbidden }
    );
  }
}

console.log("ClaimMiddleware", ClaimMiddleware);
console.log("ClaimMiddleware.length", ClaimMiddleware.length);
console.log("ClaimMiddleware.name", ClaimMiddleware.name);
console.log("ClaimMiddleware.prototype", ClaimMiddleware.prototype);
