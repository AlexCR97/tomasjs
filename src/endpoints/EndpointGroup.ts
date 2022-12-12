import { MiddlewareFactory, MiddlewareFactoryHandler, ThomasMiddleware } from "@/middleware";
import { ThomasMiddlewareHandler } from "@/middleware/types";
import { constructor } from "tsyringe/dist/typings/types";
import { Endpoint } from "./Endpoint";

export class EndpointGroup {
  /* #region Base Path */

  _basePath?: string;

  basePath(path: string): EndpointGroup {
    this._basePath = path;
    return this;
  }

  /* #endregion */

  /* #region On Before Middleware */

  readonly onBeforeMiddlewares: (
    | ThomasMiddlewareHandler
    | ThomasMiddleware
    | constructor<ThomasMiddleware>
    | MiddlewareFactoryHandler
    | MiddlewareFactory
    | constructor<MiddlewareFactory>
  )[] = []; // TODO Make private?

  onBefore(
    middleware:
      | ThomasMiddlewareHandler
      | ThomasMiddleware
      | constructor<ThomasMiddleware>
      | MiddlewareFactoryHandler
      | MiddlewareFactory
      | constructor<MiddlewareFactory>
  ): EndpointGroup {
    this.onBeforeMiddlewares.push(middleware);
    return this;
  }

  /* #endregion */

  /* #region Endpoints */

  readonly endpoints: (Endpoint | constructor<Endpoint>)[] = [];

  useEndpoint<TEndpoint extends Endpoint = Endpoint>(
    endpoint: TEndpoint | constructor<TEndpoint>
  ): EndpointGroup {
    this.endpoints.push(endpoint);
    return this;
  }

  /* #endregion */
}
