import { HttpContext, HttpMethod } from "@/core";
import { RequestHandlerMiddleware } from "./types";

export abstract class RequestHandler<TResponse = void> {
  /* #region HTTP Method */

  _method: HttpMethod = "get"; // TODO Make private?

  method(method: HttpMethod): RequestHandler<TResponse> {
    this._method = method;
    return this;
  }

  /* #endregion */

  /* #region Path */

  _path = "/"; // TODO Make private?

  path(path: string): RequestHandler<TResponse> {
    this._path = path;
    return this;
  }

  /* #endregion */

  /* #region On Before Middleware */

  readonly onBeforeMiddlewares: RequestHandlerMiddleware[] = []; // TODO Make private?

  onBefore(middleware: RequestHandlerMiddleware): RequestHandler<TResponse> {
    this.onBeforeMiddlewares.push(middleware);
    return this;
  }

  /* #endregion */

  abstract handle(context: HttpContext): TResponse | Promise<TResponse>;
}
