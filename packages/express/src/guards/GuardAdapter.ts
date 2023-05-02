import { GuardBridge } from "./GuardBridge";
import { GuardContextFactory } from "./GuardContextFactory";
import { GuardType } from "./GuardType";
import { ExpressMiddlewareFunction } from "@/core/express";
import { NotImplementedError } from "@tomasjs/core";

export abstract class GuardAdapter {
  private constructor() {}

  static toExpress(guard: GuardType): ExpressMiddlewareFunction {
    return async (req, res, next) => {
      const guardContext = GuardContextFactory.fromExpress(req, res);
      const guardResult = await new GuardBridge(guard).isAllowed(guardContext);

      if (guardResult === true) {
        return next();
      }

      if (guardResult === false) {
        throw new NotImplementedError(this.toExpress.name); // TODO Implement
        // return httpContext.respond(new UnauthorizedResponse());
      }

      throw new NotImplementedError(this.toExpress.name); // TODO Implement
      // return httpContext.respond(guardResult);
    };
  }
}
