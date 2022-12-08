import { HttpContext, HttpMethod } from "@/core";
import { MiddlewareFactory, ThomasMiddleware } from "@/middleware";
import { ThomasMiddlewareHandler } from "@/middleware/types";
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
    | ThomasMiddlewareHandler
    | ThomasMiddleware
    | constructor<ThomasMiddleware>
    | MiddlewareFactory
  )[] = []; // TODO Make private?

  onBefore(
    middleware:
      | ThomasMiddlewareHandler
      | ThomasMiddleware
      | constructor<ThomasMiddleware>
      | MiddlewareFactory
  ): Endpoint {
    this.onBeforeMiddlewares.push(middleware);
    return this;
  }

  /* #endregion */

  abstract handle(context: HttpContext): any | Promise<any>;
}
