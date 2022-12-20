import express, { json, Express, Router, text } from "express";
import { constructor } from "tsyringe/dist/typings/types";
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
  EndpointMetadata,
} from "@/endpoints";
import {
  ErrorMiddleware,
  ErrorMiddlewareAdapter,
  ErrorMiddlewareHandler,
  Middleware,
  MiddlewareAdapter,
  MiddlewareFactory,
  MiddlewareHandler,
} from "@/middleware";
import { isErrorMiddlewareHandler } from "@/middleware/ErrorMiddlewareHandler";
import { internalContainer } from "@/container";

export class AppBuilder {
  private readonly app: Express;

  constructor() {
    this.app = express();
  }

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
      | constructor<TMiddleware>
      | MiddlewareFactory<TMiddleware>
  ): AppBuilder {
    return this.useMiddlewareFor(middleware, { app: this.app });
  }

  private useMiddlewareFor<TMiddleware extends Middleware = Middleware>(
    middleware:
      | MiddlewareHandler
      | TMiddleware
      | constructor<TMiddleware>
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

  /* #endregion */

  /* #region ErrorMiddleware */

  useErrorMiddleware(
    middleware: ErrorMiddlewareHandler | ErrorMiddleware | constructor<ErrorMiddleware>
  ): AppBuilder {
    let expressErrorMiddleware: ExpressErrorMiddlewareHandler;

    if (isErrorMiddlewareHandler(middleware)) {
      expressErrorMiddleware = ErrorMiddlewareAdapter.fromTypeToExpress(middleware);
    } else if (middleware instanceof ErrorMiddleware) {
      expressErrorMiddleware = ErrorMiddlewareAdapter.fromInstanceToExpress(middleware);
    } else {
      expressErrorMiddleware = ErrorMiddlewareAdapter.fromConstructorToExpress(middleware);
    }

    this.app.use(expressErrorMiddleware);

    return this;
  }

  /* #endregion */

  /* #region Controllers */

  useController<TController extends Controller>(
    controller: TController | constructor<TController>
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
        this.useMiddlewareFor(middleware, { router });
      });
    }

    if (actions !== undefined && actions !== null && actions.length > 0) {
      for (const action of actions) {
        router[action.method](
          action.path,
          ...action.actions.map((action) => this.fromControllerActionToExpressHandler(action))
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

  /* #region Endpoints */

  useEndpoint<TEndpoint extends Endpoint = Endpoint>(
    endpoint: TEndpoint | constructor<TEndpoint>
  ): AppBuilder {
    if (endpoint instanceof Endpoint) {
      return this.useEndpointInstance(endpoint);
    }

    const endpointInstance = internalContainer.get(endpoint);
    return this.useEndpointInstance(endpointInstance);
  }

  private useEndpointInstance(endpoint: Endpoint): AppBuilder {
    const expressHandlers = EndpointAdapter.fromInstanceToExpress(endpoint);
    const metadata = new EndpointMetadata(endpoint);
    const endpointMethod = metadata.httpMethodOrDefault;
    const endpointPath = ExpressPathAdapter.adapt(metadata.path);
    this.app[endpointMethod](endpointPath, ...expressHandlers);
    return this;
  }

  /* #endregion */

  /* #region Endpoint Groups */

  useEndpointGroup(endpoints: (endpoints: EndpointGroup) => void): AppBuilder {
    const endpointGroup = new EndpointGroup();
    endpoints(endpointGroup);
    const { routerBasePath, router } = EndpointGroupAdapter.toExpressRouter(endpointGroup);
    this.app.use(routerBasePath, router);
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
    return await this.createServerAsync(port);
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
