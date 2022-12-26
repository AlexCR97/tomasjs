import { HttpContextResolver } from "@/core";
import { ExpressMiddlewareHandler } from "@/core/express";
import { UnauthorizedResponse } from "@/responses/status-codes";
import { GuardBridge } from "./GuardBridge";
import { GuardContextFactory } from "./GuardContextFactory";
import { GuardType } from "./GuardType";

export abstract class GuardAdapter {
  private constructor() {}

  static toExpress(guard: GuardType): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const httpContext = HttpContextResolver.fromExpress(req, res);
      const guardContext = GuardContextFactory.fromHttpContext(httpContext);
      const guardBridge = new GuardBridge(guard);
      const isAllowed = await guardBridge.isAllowed(guardContext);

      if (isAllowed) {
        return next();
      }

      // TODO Add options for this. Use decorators?
      return httpContext.respond(new UnauthorizedResponse());
    };
  }
}
