import { HttpContext } from "@/core";
import { Middleware } from "@/middleware";
import { ForbiddenResponse } from "@/responses/status-codes";
import { NextFunction } from "express";
import { RequiredClaim } from "./RequiredClaim";

export class RequiredClaimMiddleware extends Middleware {
  constructor(private readonly requiredClaim: RequiredClaim) {
    super();
  }
  handle(context: HttpContext, next: NextFunction): void | Promise<void> {
    const claims = context.user?.claims;

    if (claims === undefined || claims === null) {
      console.log("no claims!");
      return context.respond(new ForbiddenResponse());
    }

    const hasClaim = Object.keys(claims).some((key) => key === this.requiredClaim.type);

    if (!hasClaim) {
      console.log("claim not found");
      return context.respond(new ForbiddenResponse());
    }

    if (this.requiredClaim.value === undefined || this.requiredClaim.value === null) {
      return next();
    }

    const claimValue = claims[this.requiredClaim.type];

    if (claimValue !== this.requiredClaim.value) {
      console.log("invalid claim");
      return context.respond(new ForbiddenResponse());
    }

    return next();
  }
}
