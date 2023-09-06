import { GuardResultResolver } from "./GuardResultResolver";
import { GuardType } from "./GuardType";
import { ExpressMiddlewareFunction } from "@/core/express";
import { Container } from "@tomasjs/core";
import { UnauthorizedResponse } from "@/responses/status-codes";
import { guardContextFactory } from "./GuardContext";

export class GuardAdapter {
  private readonly container: Container;
  private readonly guard: GuardType;

  constructor(options: { container: Container; guard: GuardType }) {
    this.container = options.container;
    this.guard = options.guard;
  }

  adapt(): ExpressMiddlewareFunction {
    return async (req, res, next) => {
      const guardContext = guardContextFactory(req, res);
      const guardResultResolver = new GuardResultResolver(this.container, this.guard);
      const guardResult = await guardResultResolver.isAllowedAsync(guardContext);

      if (typeof guardResult === "boolean") {
        return guardResult === true
          ? next()
          : guardContext.response.send(new UnauthorizedResponse());
      }

      return guardContext.response.send(guardResult);
    };
  }
}
