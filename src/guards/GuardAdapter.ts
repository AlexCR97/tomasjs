import { HttpContextResolver } from "@/core";
import { ExpressMiddlewareHandler } from "@/core/express";
import { UnauthorizedResponse } from "@/responses/status-codes";
import { GuardBridge } from "./GuardBridge";
import { GuardType } from "./GuardType";

export abstract class GuardAdapter {
  private constructor() {}

  static toExpress(guard: GuardType): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res);
      const guardBridge = new GuardBridge(guard);
      const isAllowed = await guardBridge.isAllowed(context);

      if (isAllowed) {
        return next();
      }

      // TODO Add options for this. Use decorators?
      return context.respond(new UnauthorizedResponse());
    };
  }
}
