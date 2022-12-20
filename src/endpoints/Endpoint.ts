import { ClassConstructor } from "@/container";
import { HttpContext } from "@/core";
import {
  Middleware,
  MiddlewareFactory,
  MiddlewareFactoryHandler,
  MiddlewareHandler,
} from "@/middleware";

export abstract class Endpoint {
  /* #region On Before Middleware */

  readonly onBeforeMiddlewares: (
    | MiddlewareHandler
    | Middleware
    | ClassConstructor<Middleware>
    | MiddlewareFactoryHandler
    | MiddlewareFactory
    | ClassConstructor<MiddlewareFactory>
  )[] = []; // TODO Make private?

  onBefore(
    middleware:
      | MiddlewareHandler
      | Middleware
      | ClassConstructor<Middleware>
      | MiddlewareFactoryHandler
      | MiddlewareFactory
      | ClassConstructor<MiddlewareFactory>
  ): Endpoint {
    this.onBeforeMiddlewares.push(middleware);
    return this;
  }

  /* #endregion */

  abstract handle(context: HttpContext): any | Promise<any>;
}
