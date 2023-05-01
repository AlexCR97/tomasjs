import { Express, Router } from "express";
import { Guard, GuardAdapter, GuardType } from "@/guards";
import { Middleware, MiddlewareAdapter, MiddlewareFactory, MiddlewareType } from "@/middleware";
import { ApiBuilder } from "./ApiBuilder";
import { Container, NotImplementedError } from "@tomasjs/core";

export abstract class AbstractApiBuilder<TBuilder extends AbstractApiBuilder<any>>
  implements ApiBuilder<TBuilder>
{
  protected abstract readonly root: Express | Router;
  protected readonly middlewares: MiddlewareType[] = [];
  protected readonly guards: GuardType[] = [];

  protected get container(): Container {
    throw new NotImplementedError("get container"); // TODO Implement
  }

  /* #region Middlewares */

  useMiddleware<TMiddleware extends Middleware = Middleware>(
    middleware: MiddlewareType<TMiddleware>
  ): TBuilder {
    this.middlewares.push(middleware);
    return this as any; // TODO Figure out how to satisfy generic
  }

  private bindMiddleware<TMiddleware extends Middleware = Middleware>(
    middleware: MiddlewareType<TMiddleware>
  ) {
    const expressMiddleware =
      middleware instanceof MiddlewareFactory
        ? MiddlewareAdapter.from(middleware.create())
        : MiddlewareAdapter.from(middleware);
    this.root.use(expressMiddleware);
    return this;
  }

  protected tryBindMiddlewares() {
    if (this.middlewares.length === 0) {
      return this;
    }

    for (const middleware of this.middlewares) {
      this.bindMiddleware(middleware);
    }

    return this;
  }

  /* #endregion */

  /* #region Guards */

  useGuard<TGuard extends Guard = Guard>(guard: GuardType<TGuard>): TBuilder {
    this.guards.push(guard);
    return this as any; // TODO Figure out how to satisfy generic
  }

  private bindGuard(guard: GuardType) {
    const expressMiddlewareFunction = GuardAdapter.toExpress(guard);
    this.root.use(expressMiddlewareFunction);
    return this;
  }

  protected tryBindGuards() {
    if (this.guards.length === 0) {
      return this;
    }

    for (const guard of this.guards) {
      this.bindGuard(guard);
    }

    return this;
  }

  /* #endregion */
}
