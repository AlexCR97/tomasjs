import { RequestHandler } from "@/core/handlers";
import { HttpMethod } from "@/HttpMethod";
import {
  ControllerActionMap,
  ControllerActionOptions,
  ControllerMiddleware,
  ControllerMiddlewareMap,
} from "./types";

export abstract class Controller {
  /* #region Route */
  path?: string; // This will be used in AppBuilder (hacking with the "any" type) // TODO Set to private
  route(path: string): Controller {
    this.path = path;
    return this;
  }
  /* #endregion */

  /* #region On Before (per-controller middleware) */
  private readonly onBeforeMiddleware: ControllerMiddleware[] = [];
  onBefore(middleware: ControllerMiddleware): Controller {
    this.onBeforeMiddleware.push(middleware);
    return this;
  }
  /* #endregion */

  /* #region On After (per-controller middleware) */
  private readonly onAfterMiddleware: ControllerMiddleware[] = [];
  onAfter(middleware: ControllerMiddleware): Controller {
    this.onAfterMiddleware.push(middleware);
    return this;
  }
  /* #endregion */

  /* #region Actions/Middlewares (per-path actions/middlewares*/

  private readonly actions: ControllerActionMap<any>[] = [];
  private readonly onBeforeMiddlewareMap: ControllerMiddlewareMap[] = [];
  private readonly onAfterMiddlewareMap: ControllerMiddlewareMap[] = [];

  get<TResponse = void>(
    path: string,
    handler: RequestHandler<TResponse>,
    options?: ControllerActionOptions
  ): Controller {
    this.registerAction("get", path, handler, options);
    return this;
  }

  post<TResponse = void>(
    path: string,
    handler: RequestHandler<TResponse>,
    options?: ControllerActionOptions
  ): Controller {
    this.registerAction("post", path, handler, options);
    return this;
  }

  put<TResponse = void>(
    path: string,
    handler: RequestHandler<TResponse>,
    options?: ControllerActionOptions
  ): Controller {
    this.registerAction("put", path, handler, options);
    return this;
  }

  patch<TResponse = void>(
    path: string,
    handler: RequestHandler<TResponse>,
    options?: ControllerActionOptions
  ): Controller {
    this.registerAction("patch", path, handler, options);
    return this;
  }

  delete<TResponse = void>(
    path: string,
    handler: RequestHandler<TResponse>,
    options?: ControllerActionOptions
  ): Controller {
    this.registerAction("delete", path, handler, options);
    return this;
  }

  private registerAction<TResponse = void>(
    method: HttpMethod,
    path: string,
    handler: RequestHandler<TResponse>,
    options?: ControllerActionOptions
  ) {
    this.onBeforeMiddlewareMap.push(
      ...this.toControllerMiddlewareMaps(method, path, options?.onBefore)
    );

    this.onAfterMiddlewareMap.push(
      ...this.toControllerMiddlewareMaps(method, path, options?.onAfter)
    );

    this.actions.push({
      method,
      path,
      handler, // TODO Is an arrow function required here?
    });
  }

  private toControllerMiddlewareMaps(
    method: HttpMethod,
    path: string,
    middlewares: ControllerMiddleware[] | undefined
  ): ControllerMiddlewareMap[] {
    if (middlewares === undefined || middlewares === null || middlewares.length === 0) {
      return [];
    }

    return middlewares.map((middleware) => ({
      method,
      path,
      middleware,
    }));
  }

  /* #endregion */
}
