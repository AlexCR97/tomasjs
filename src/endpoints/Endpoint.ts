import { ClassConstructor } from "@/container";
import { HttpContext, HttpMethod } from "@/core";
import {
  Middleware,
  MiddlewareFactory,
  MiddlewareFactoryHandler,
  MiddlewareHandler,
} from "@/middleware";

export abstract class Endpoint {
  /* #region HTTP Method */

  _method: HttpMethod = "get"; // TODO Make private?

  method(method: HttpMethod): Endpoint {
    this._method = method;
    return this;
  }

  /* #endregion */

  /* #region Path */

  _path = "/"; // TODO Make private?

  path(path: string): Endpoint {
    this._path = path;
    return this;
  }

  /* #endregion */

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
