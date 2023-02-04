import { Express, Router } from "express";
import { ClassConstructor, internalContainer } from "@/container";
import { ExpressPathAdapter } from "@/core/express";
import { Endpoint, EndpointAdapter, EndpointType, isEndpoint } from "@/endpoints";
import { EndpointMetadataStrategy } from "@/endpoints/metadata";
import { Guard, GuardAdapter, GuardType } from "@/guards";
import { Middleware, MiddlewareAdapter, MiddlewareFactory, MiddlewareType } from "@/middleware";
import { ApiBuilder } from "./ApiBuilder";
import { Controller, ControllerType } from "@/controllers";
import { NotImplementedError } from "@/core/errors";

export abstract class AbstractApiBuilder<TBuilder extends AbstractApiBuilder<any>>
  implements ApiBuilder<TBuilder>
{
  protected abstract readonly root: Express | Router;
  protected readonly middlewares: MiddlewareType[] = [];
  protected readonly guards: GuardType[] = [];
  protected readonly endpoints: EndpointType[] = [];
  protected readonly controllers: ControllerType[] = [];

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

  /* #region Endpoints */

  useEndpoint<TEndpoint extends Endpoint = Endpoint>(endpoint: EndpointType<TEndpoint>): TBuilder {
    this.endpoints.push(endpoint);
    return this as any; // TODO Figure out how to satisfy generic
  }

  private bindEndpoint<TEndpoint extends Endpoint = Endpoint>(
    endpoint: TEndpoint | ClassConstructor<TEndpoint>
  ) {
    if (isEndpoint(endpoint)) {
      return this.bindEndpointInstance(endpoint);
    }

    // console.log("resolving endpoint...", endpoint);
    const endpointInstance = internalContainer.get(endpoint);
    // console.log("endpointInstance", endpointInstance);
    return this.bindEndpointInstance(endpointInstance);
  }

  private bindEndpointInstance(endpoint: Endpoint) {
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

  protected tryBindEndpoints() {
    if (this.endpoints.length === 0) {
      return this;
    }

    for (const endpoint of this.endpoints) {
      this.bindEndpoint(endpoint as any); // TODO Resolve "any"?
    }

    return this;
  }

  /* #endregion */

  /* #region Controllers */

  useController<TController extends Controller = Controller>(
    controller: ControllerType<TController>
  ): TBuilder {
    this.controllers.push(controller);
    return this as any; // TODO Figure out how to satisfy generic
  }

  private bindController<TController extends Controller = Controller>(
    controller: ControllerType<TController>
  ) {
    if (isController(controller)) {
      return this.bindControllerInstance(controller);
    }

    const controllerInstance = internalContainer.get<TController>(controller);
    return this.bindControllerInstance(controllerInstance);
  }

  private bindControllerInstance(controller: Controller) {
    throw new NotImplementedError(this.bindControllerInstance.name);
  }

  protected tryBindControllers() {
    if (this.controllers.length === 0) {
      return this;
    }

    for (const controller of this.controllers) {
      this.bindController(controller);
    }

    return this;
  }

  /* #endregion */
}

function isController<TController extends Controller>(obj: any): obj is TController {
  // TODO Implement method isController
  throw new NotImplementedError(isController.name);
}
