import { GuardResultResolver } from "./GuardResultResolver";
import { GuardContextFactory } from "./GuardContextFactory";
import { GuardType } from "./GuardType";
import { ExpressMiddlewareFunction } from "@/core/express";
import { Container, Logger } from "@tomasjs/core";
import { ResponseAdapter } from "@/responses";
import { UnauthorizedResponse } from "@/responses/status-codes";

export class GuardAdapter {
  constructor(
    private readonly options: {
      container: Container;
      guard: GuardType;
      logger?: Logger;
    }
  ) {}

  private get container(): Container {
    return this.options.container;
  }

  private get guard(): GuardType {
    return this.options.guard;
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  adapt(): ExpressMiddlewareFunction {
    return async (req, res, next) => {
      const guardContext = new GuardContextFactory(req, res).create();
      const guardResultResolver = new GuardResultResolver(this.container, this.guard);
      const guardResult = await guardResultResolver.isAllowedAsync(guardContext);

      if (guardResult === true) {
        return next();
      }

      if (guardResult === false) {
        ResponseAdapter.fromThomasToExpress(res, new UnauthorizedResponse(), {
          logger: this.logger,
        });
        return;
      }

      ResponseAdapter.fromThomasToExpress(res, guardResult);
    };
  }
}
