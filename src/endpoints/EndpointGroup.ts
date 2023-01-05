import { ClassConstructor } from "@/container";
import { GuardType } from "@/guards";
import {
  Middleware,
  MiddlewareFactory,
  MiddlewareFactoryHandler,
  MiddlewareHandler,
} from "@/middleware";
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
  ): EndpointGroup {
    this.onBeforeMiddlewares.push(middleware);
    return this;
  }

  /* #endregion */

  /* #region Guards */

  readonly guards: GuardType[] = [];

  useGuard(guard: GuardType): EndpointGroup {
    this.guards.push(guard);
    return this;
  }

  /* #endregion */

  /* #region Endpoints */

  readonly endpoints: (Endpoint | ClassConstructor<Endpoint>)[] = [];

  useEndpoint<TEndpoint extends Endpoint = Endpoint>(
    endpoint: TEndpoint | ClassConstructor<TEndpoint>
  ): EndpointGroup {
    this.endpoints.push(endpoint);
    return this;
  }

  /* #endregion */
}
