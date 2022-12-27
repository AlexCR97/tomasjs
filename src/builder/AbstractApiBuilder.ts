import { Express, Router } from "express";
import { ClassConstructor, internalContainer } from "@/container";
import { ExpressPathAdapter } from "@/core/express";
import {
  Endpoint,
  EndpointAdapter,
  EndpointType,
  isEndpoint,
} from "@/endpoints";
import { EndpointMetadataStrategy } from "@/endpoints/metadata";
import { Guard, GuardAdapter, GuardType } from "@/guards";
import {
  Middleware,
  MiddlewareAdapter,
  MiddlewareFactory,
  MiddlewareType,
} from "@/middleware";
import { ApiBuilder } from "./ApiBuilder";

export abstract class AbstractApiBuilder implements ApiBuilder {
  protected abstract readonly root: Express | Router;
  protected readonly middlewares: MiddlewareType[] = [];
  protected readonly guards: GuardType[] = [];
  protected readonly endpoints: EndpointType[] = [];

  /* #region Middlewares */

  useMiddleware<TMiddleware extends Middleware = Middleware>(
    middleware: MiddlewareType<TMiddleware>
  ): ApiBuilder {
    this.middlewares.push(middleware);
    return this;
  }

  private bindMiddleware<TMiddleware extends Middleware = Middleware>(
    middleware: MiddlewareType<TMiddleware>
  ): AbstractApiBuilder {
    const expressMiddleware =
      middleware instanceof MiddlewareFactory
        ? MiddlewareAdapter.from(middleware.create())
        : MiddlewareAdapter.from(middleware);
    this.root.use(expressMiddleware);
    return this;
  }

  protected tryBindMiddlewares(): AbstractApiBuilder {
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

  useGuard<TGuard extends Guard = Guard>(guard: GuardType<TGuard>): ApiBuilder {
    this.guards.push(guard);
    return this;
  }

  private bindGuard(guard: GuardType): AbstractApiBuilder {
    const expressMiddlewareFunction = GuardAdapter.toExpress(guard);
    this.root.use(expressMiddlewareFunction);
    return this;
  }

  protected tryBindGuards(): AbstractApiBuilder {
    if (this.guards.length === 0) {
      return this;
    }

    for (const guard of this.guards) {
      this.bindGuard(guard);
    }

    return this;
  }

  /* #endregion */

  /* #region Endpoints */

  useEndpoint<TEndpoint extends Endpoint = Endpoint>(
    endpoint: EndpointType<TEndpoint>
  ): ApiBuilder {
    this.endpoints.push(endpoint);
    return this;
  }

  private bindEndpoint<TEndpoint extends Endpoint = Endpoint>(
    endpoint: TEndpoint | ClassConstructor<TEndpoint>
  ): AbstractApiBuilder {
    if (isEndpoint(endpoint)) {
      return this.bindEndpointInstance(endpoint);
    }

    // console.log("resolving endpoint...", endpoint);
    const endpointInstance = internalContainer.get(endpoint);
    // console.log("endpointInstance", endpointInstance);
    return this.bindEndpointInstance(endpointInstance);
  }

  private bindEndpointInstance(endpoint: Endpoint): AbstractApiBuilder {
    const expressHandlers = EndpointAdapter.fromInstanceToExpress(endpoint);
    // console.log("expressHandlers", expressHandlers);

    const metadata = EndpointMetadataStrategy.get(endpoint);
    // console.log("metadata", metadata);

    const endpointMethod = metadata.httpMethodOrDefault;
    // console.log("endpointMethod", endpointMethod);

    const endpointPath = ExpressPathAdapter.adapt(metadata.path);
    // console.log("endpointPath", endpointPath);

    // Convert root to "any" so TypeScript doesn't complain about rest parameter
    (this.root as any)[endpointMethod](endpointPath, ...expressHandlers);
    // console.log("after express app");

    return this;
  }

  protected tryBindEndpoints(): AbstractApiBuilder {
    if (this.endpoints.length === 0) {
      return this;
    }

    for (const endpoint of this.endpoints) {
      this.bindEndpoint(endpoint as any); // TODO Resolve "any"?
    }

    return this;
  }

  /* #endregion */
}
