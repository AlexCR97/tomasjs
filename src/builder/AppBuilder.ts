import express, { json, Express, Router, text } from "express";
import { Controller } from "@/controllers";
import { ControllerAction } from "@/controllers/types";
import {
  ExpressErrorMiddlewareHandler,
  ExpressMiddlewareHandler,
  ExpressPathAdapter,
  ExpressRequestHandler,
} from "@/core/express";
import {
  Endpoint,
  EndpointAdapter,
  EndpointGroup,
  EndpointGroupAdapter,
  isEndpoint,
} from "@/endpoints";
import {
  ErrorMiddlewareAdapter,
  ErrorMiddlewareType,
  Middleware,
  MiddlewareAdapter,
  MiddlewareFactory,
  MiddlewareHandler,
  MiddlewareType,
} from "@/middleware";
import { isErrorMiddlewareHandler } from "@/middleware/ErrorMiddlewareHandler";
import { ClassConstructor, internalContainer } from "@/container";
import { EndpointMetadataStrategy } from "@/endpoints/metadata";
import { isErrorMiddleware } from "@/middleware/isErrorMiddleware";
import { GuardAdapter, GuardType } from "@/guards";

export class AppBuilder {
  private readonly app = express();
  private readonly middlewares: MiddlewareType[] = [];
  private readonly guards: GuardType[] = [];
  private readonly endpointGroups: ((endpoints: EndpointGroup) => void)[] = [];
  private readonly endpoints: (Endpoint | ClassConstructor<Endpoint>)[] = [];
  private errorMiddleware?: ErrorMiddlewareType;

  /* #region Standard Setup */

  use(appSetup: (app: Express) => void): AppBuilder {
    appSetup(this.app);
    return this;
  }

  /* #endregion */

  /* #region Formatters */

  useText(): AppBuilder {
    this.app.use(text());
    return this;
  }

  useJson(): AppBuilder {
    this.app.use(
      json({
        type: "*/*", // TODO is this needed?
      })
    );
    return this;
  }

  /* #endregion */

  /* #region Middleware */

  useMiddleware<TMiddleware extends Middleware = Middleware>(
    middleware:
      | MiddlewareHandler
      | TMiddleware
      | ClassConstructor<TMiddleware>
      | MiddlewareFactory<TMiddleware>
  ): AppBuilder {
    this.middlewares.push(middleware);
    return this;
  }

  private bindMiddleware<TMiddleware extends Middleware = Middleware>(
    middleware:
      | MiddlewareHandler
      | TMiddleware
      | ClassConstructor<TMiddleware>
      | MiddlewareFactory<TMiddleware>,
    source: { app?: Express; router?: Router }
  ): AppBuilder {
    const expressMiddleware =
      middleware instanceof MiddlewareFactory
        ? MiddlewareAdapter.from(middleware.create())
        : MiddlewareAdapter.from(middleware);
    source.app?.use(expressMiddleware);
    source.router?.use(expressMiddleware);
    return this;
  }

  private tryBindMiddlewares(): AppBuilder {
    if (
      this.middlewares === undefined ||
      this.middlewares === null ||
      this.middlewares.length === 0
    ) {
      return this;
    }

    for (const middleware of this.middlewares) {
      this.bindMiddleware(middleware, { app: this.app });
    }

    return this;
  }

  /* #endregion */

  /* #region ErrorMiddleware */

  useErrorMiddleware(middleware: ErrorMiddlewareType): AppBuilder {
    this.errorMiddleware = middleware;
    return this;
  }

  private bindErrorMiddleware(middleware: ErrorMiddlewareType): AppBuilder {
    let expressErrorMiddleware: ExpressErrorMiddlewareHandler;

    if (isErrorMiddlewareHandler(middleware)) {
      expressErrorMiddleware =
        ErrorMiddlewareAdapter.fromTypeToExpress(middleware);
    } else if (isErrorMiddleware(middleware)) {
      expressErrorMiddleware =
        ErrorMiddlewareAdapter.fromInstanceToExpress(middleware);
    } else {
      expressErrorMiddleware =
        ErrorMiddlewareAdapter.fromConstructorToExpress(middleware);
    }

    this.app.use(expressErrorMiddleware);

    return this;
  }

  private tryBindErrorMiddleware() {
    if (this.errorMiddleware === undefined || this.errorMiddleware === null) {
      return this;
    }

    return this.bindErrorMiddleware(this.errorMiddleware);
  }

  /* #endregion */

  /* #region Controllers */

  useController<TController extends Controller>(
    controller: TController | ClassConstructor<TController>
  ): AppBuilder {
    if (controller instanceof Controller) {
      const router = this.toRouter(controller);
      const controllerPath = this.getRoutingPath(controller);
      this.app.use(controllerPath, router);
    } else {
      internalContainer.addClass(controller);
      const controllerInstance = internalContainer.get(controller);
      const router = this.toRouter(controllerInstance);
      const controllerPath = this.getRoutingPath(controllerInstance);
      this.app.use(controllerPath, router);
    }

    return this;
  }

  private getRoutingPath(controller: Controller) {
    const path = controller.path?.trim();

    if (path === undefined || path === null || path.length === 0) {
      return "/";
    }

    return `/${path}`;
  }

  private toRouter(controllerInstance: Controller): Router {
    const router = Router();
    const onBeforeMiddlewares = controllerInstance.onBeforeMiddlewares;
    const actions = controllerInstance.actions;

    if (
      onBeforeMiddlewares !== undefined &&
      onBeforeMiddlewares !== null &&
      onBeforeMiddlewares.length > 0
    ) {
      onBeforeMiddlewares.forEach((middleware) => {
        this.bindMiddleware(middleware, { router });
      });
    }

    if (actions !== undefined && actions !== null && actions.length > 0) {
      for (const action of actions) {
        router[action.method](
          action.path,
          ...action.actions.map((action) =>
            this.fromControllerActionToExpressHandler(action)
          )
        );
      }
    }

    return router;
  }

  private fromControllerActionToExpressHandler(
    action: ControllerAction
  ): ExpressMiddlewareHandler | ExpressRequestHandler {
    throw new Error("Not implemented");

    // if (action instanceof Middleware) {
    //   return async (req, res, next) => {
    //     await action.handle(req, res, next); // TODO Will this work with DI?
    //   };
    // } else if (typeof action === "function") {
    //   return async (req: Request, res: Response) => {
    //     const httpContext = HttpContextResolver.fromExpress(req, res);
    //     const actionResponse = await (action as any)(httpContext);
    //     return ResponseAdapter.fromThomasToExpress(res, actionResponse);
    //   };
    // } else {
    //   const middleware = action as constructor<Middleware>;
    //   const middlewareInstance = container.resolve(middleware);
    //   return async (req, res, next) => {
    //     await middlewareInstance.handle(req, res, next); // TODO Will this work with DI?
    //   };
    // }
  }

  /* #endregion */

  /* #region Guards */

  useGuard(guard: GuardType): AppBuilder {
    this.guards.push(guard);
    return this;
  }

  private bindGuard(guard: GuardType): AppBuilder {
    const expressMiddlewareFunction = GuardAdapter.toExpress(guard);
    this.app.use(expressMiddlewareFunction);
    return this;
  }

  private tryBindGuards(): AppBuilder {
    if (
      this.guards === undefined ||
      this.guards === null ||
      this.guards.length === 0
    ) {
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
    endpoint: TEndpoint | ClassConstructor<TEndpoint>
  ): AppBuilder {
    this.endpoints.push(endpoint);
    return this;
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

  private bindEndpointInstance(endpoint: Endpoint): AppBuilder {
    const expressHandlers = EndpointAdapter.fromInstanceToExpress(endpoint);
    // console.log("expressHandlers", expressHandlers);

    const metadata = EndpointMetadataStrategy.get(endpoint);
    // console.log("metadata", metadata);

    const endpointMethod = metadata.httpMethodOrDefault;
    // console.log("endpointMethod", endpointMethod);

    const endpointPath = ExpressPathAdapter.adapt(metadata.path);
    // console.log("endpointPath", endpointPath);

    this.app[endpointMethod](endpointPath, ...expressHandlers);
    // console.log("after express app");

    return this;
  }

  private tryBindEndpoints(): AppBuilder {
    if (
      this.endpoints === undefined ||
      this.endpoints === null ||
      this.endpoints.length === 0
    ) {
      return this;
    }

    for (const endpoint of this.endpoints) {
      this.bindEndpoint(endpoint);
    }

    return this;
  }

  /* #endregion */

  /* #region Endpoint Groups */

  useEndpointGroup(endpoints: (endpoints: EndpointGroup) => void): AppBuilder {
    this.endpointGroups.push(endpoints);
    return this;
  }

  private bindEndpointGroup(
    endpoints: (endpoints: EndpointGroup) => void
  ): AppBuilder {
    const endpointGroup = new EndpointGroup();
    endpoints(endpointGroup);
    const { routerBasePath, router } =
      EndpointGroupAdapter.toExpressRouter(endpointGroup);
    this.app.use(routerBasePath, router);
    return this;
  }

  private tryBindEndpointGroups(): AppBuilder {
    if (
      this.endpointGroups === undefined ||
      this.endpointGroups === null ||
      this.endpointGroups.length === 0
    ) {
      return this;
    }

    for (const endpointGroup of this.endpointGroups) {
      this.bindEndpointGroup(endpointGroup);
    }

    return this;
  }

  /* #endregion */

  /* #region CQRS */

  useCommandHandler(commandHandlerClass: any): AppBuilder {
    internalContainer.addClass(commandHandlerClass);
    return this;
  }

  useQueryHandler(queryHandlerClass: any): AppBuilder {
    internalContainer.addClass(queryHandlerClass);
    return this;
  }

  useEventHandler(eventHandlerClass: any): AppBuilder {
    internalContainer.addClass(eventHandlerClass);
    return this;
  }

  /* #endregion */

  /* #region Hosting */

  useSpa(options: { spaPath: string }): AppBuilder {
    this.app.use(express.static(options.spaPath));

    this.app.get("/*", (req, res) => {
      const spaIndexFile = `${options.spaPath}/index.html`;
      res.sendFile(spaIndexFile);
    });

    return this;
  }

  /* #endregion */

  /* #region Build */

  // TODO Add return type
  async buildAsync(port: number) {
    return await this.tryBindMiddlewares()
      .tryBindGuards()
      .tryBindEndpointGroups()
      .tryBindEndpoints()
      .tryBindErrorMiddleware()
      .createServerAsync(port);
  }

  // TODO Add return type
  private async createServerAsync(port: number) {
    return new Promise<any>((resolve, reject) => {
      const server = this.app
        .listen(port, () => {
          return resolve(server);
        })
        .on("error", (err) => {
          return reject(err);
        });
    });
  }

  /* #endregion */
}
