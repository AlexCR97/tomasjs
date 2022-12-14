import { HttpContext, HttpMethod } from "@/core";
import {
  Middleware,
  MiddlewareFactory,
  MiddlewareFactoryHandler,
  MiddlewareHandler,
} from "@/middleware";
import { constructor } from "tsyringe/dist/typings/types";

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
    | constructor<Middleware>
    | MiddlewareFactoryHandler
    | MiddlewareFactory
    | constructor<MiddlewareFactory>
  )[] = []; // TODO Make private?

  onBefore(
    middleware:
      | MiddlewareHandler
      | Middleware
      | constructor<Middleware>
      | MiddlewareFactoryHandler
      | MiddlewareFactory
      | constructor<MiddlewareFactory>
  ): Endpoint {
    this.onBeforeMiddlewares.push(middleware);
    return this;
  }

  /* #endregion */

  abstract handle(context: HttpContext): any | Promise<any>;
}
