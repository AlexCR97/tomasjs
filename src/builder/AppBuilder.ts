import { DefaultLogger } from "@/core/logger";
import { environment } from "@/environment";
import express, { json, Express, NextFunction, Request, Response, Router, text } from "express";
import { container, DependencyContainer } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import {
  ExpressRequestHandlerFactory,
  RequestHandlerResolver,
  RequestHandlerResponseAdapter,
} from "./requests";
import {
  ErrorMiddleware,
  ErrorMiddlewareAdapter,
  Middleware,
  MiddlewareAdapter,
  ThomasErrorMiddleware,
  ThomasMiddleware,
} from "@/middleware";
import { Controller } from "@/controllers";
import { ControllerAction } from "@/controllers/types";
import { HttpContext } from "@/core";
import { RequestHandler } from "@/requests";
import { HttpContextBinder } from "@/core/HttpContextBinder";
import { ExpressRequestHandler } from "@/core/handlers";
import {
  ExpressErrorMiddlewareHandler,
  ExpressMiddlewareHandler,
  MiddlewareHandler,
  ThomasErrorMiddlewareHandler,
  ThomasMiddlewareHandler,
} from "@/middleware/types";

export class AppBuilder {
  private readonly app: Express;
  private readonly logger = new DefaultLogger(AppBuilder.name, { level: "warn" });

  constructor() {
    this.logger.debug("Building app...");
    this.app = express();
  }

  /* #region Standard Setup */

  register(containerSetup: (container: DependencyContainer) => void): AppBuilder {
    containerSetup(container);
    return this;
  }

  use(appSetup: (app: Express) => void): AppBuilder {
    appSetup(this.app);
    return this;
  }

  /* #endregion */

  /* #region Formatters */

  useText(): AppBuilder {
    this.logger.debug(`.${this.useText.name}`);
    this.app.use(text());
    return this;
  }

  useJson(): AppBuilder {
    this.logger.debug(`.${this.useJson.name}`);
    this.app.use(
      json({
        type: "*/*", // TODO is this needed?
      })
    );
    return this;
  }

  /* #endregion */

  /* #region Middleware */

  useMiddleware<TMiddleware extends Middleware | ErrorMiddleware>(
    middleware: TMiddleware | constructor<TMiddleware>
  ): AppBuilder {
    if (middleware instanceof Middleware || middleware instanceof ErrorMiddleware) {
      this.registerMiddleware(middleware);
    } else {
      container.register(middleware.name, middleware);
      const middlewareInstance = container.resolve(middleware);
      this.registerMiddleware(middlewareInstance);
    }

    return this;
  }

  private registerMiddleware(middleware: Middleware | ErrorMiddleware) {
    if (middleware instanceof Middleware) {
      this.app.use(
        async (req: Request, res: Response, next: NextFunction) =>
          await middleware.handle(req, res, next)
      );
    } else if (middleware instanceof ErrorMiddleware) {
      this.app.use((err: any, req: Request, res: Response, next: NextFunction) =>
        middleware.handle(err, req, res, next)
      );
    } else {
      throw new Error(`Unknown middleware: "${middleware}"`);
    }
  }

  private useMiddlewareRouter<TMiddleware extends Middleware | ErrorMiddleware>(
    router: Router,
    middleware: TMiddleware | constructor<TMiddleware>
  ): AppBuilder {
    if (middleware instanceof Middleware || middleware instanceof ErrorMiddleware) {
      this.registerMiddlewareRouter(router, middleware);
    } else {
      container.register(middleware.name, middleware);
      const middlewareInstance = container.resolve(middleware);
      this.registerMiddlewareRouter(router, middlewareInstance);
    }

    return this;
  }

  private registerMiddlewareRouter(router: Router, middleware: Middleware | ErrorMiddleware) {
    if (middleware instanceof Middleware) {
      router.use(
        async (req: Request, res: Response, next: NextFunction) =>
          await middleware.handle(req, res, next)
      );
    } else if (middleware instanceof ErrorMiddleware) {
      router.use((err: any, req: Request, res: Response, next: NextFunction) =>
        middleware.handle(err, req, res, next)
      );
    } else {
      throw new Error(`Unknown middleware: "${middleware}"`);
    }
  }

  useMiddlewarex(
    middleware: ThomasMiddlewareHandler | ThomasMiddleware | constructor<ThomasMiddleware>
  ): AppBuilder {
    return this.useMiddlewareFor(middleware, { app: this.app });
  }

  private useMiddlewareFor(
    middleware: ThomasMiddlewareHandler | ThomasMiddleware | constructor<ThomasMiddleware>,
    source: { app?: Express; router?: Router }
  ): AppBuilder {
    let expressMiddleware: ExpressMiddlewareHandler;

    if (typeof middleware === "function") {
      expressMiddleware = MiddlewareAdapter.fromTypeToExpress(middleware as any);
    } else if (middleware instanceof ThomasMiddleware) {
      expressMiddleware = MiddlewareAdapter.fromInstanceToExpress(middleware);
    } else {
      expressMiddleware = MiddlewareAdapter.fromConstructorToExpress(middleware);
    }

    source.app?.use(expressMiddleware);
    source.router?.use(expressMiddleware);

    return this;
  }

  /* #endregion */

  /* #region ErrorMiddleware */

  useErrorMiddleware(
    middleware:
      | ThomasErrorMiddlewareHandler
      | ThomasErrorMiddleware
      | constructor<ThomasErrorMiddleware>
  ): AppBuilder {
    let expressErrorMiddleware: ExpressErrorMiddlewareHandler;

    if (typeof middleware === "function") {
      expressErrorMiddleware = ErrorMiddlewareAdapter.fromTypeToExpress(middleware as any);
    } else if (middleware instanceof ThomasErrorMiddleware) {
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
    this.logger.debug(`.${this.useController.name}`, { controllerConstructor: controller });

    if (controller instanceof Controller) {
      const router = this.toRouter(controller);
      const controllerPath = this.getRoutingPath(controller);
      this.app.use(controllerPath, router);
    } else {
      container.register(controller.name, controller);
      const controllerInstance = container.resolve(controller);
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
        this.useMiddlewareRouter(router, middleware);
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
  ): ExpressRequestHandler | MiddlewareHandler {
    if (action instanceof Middleware) {
      return async (req, res, next) => {
        await action.handle(req, res, next); // TODO Will this work with DI?
      };
    } else if (typeof action === "function") {
      return async (req: Request, res: Response) => {
        const httpContext = this.resolveAndBindHttpContext(req, res);
        const actionResponse = await (action as any)(httpContext);
        return RequestHandlerResponseAdapter.toExpressResponse(res, actionResponse);
      };
    } else {
      const middleware = action as constructor<Middleware>;
      const middlewareInstance = container.resolve(middleware);
      return async (req, res, next) => {
        await middlewareInstance.handle(req, res, next); // TODO Will this work with DI?
      };
    }
  }

  /* #endregion */

  /* #region Request Handlers */

  private isHttpContextInitialized = false;

  useHttpContext(): AppBuilder {
    this.app.use((req, res, next) => {
      this.resolveAndBindHttpContext(req, res);
      next();
    });
    this.isHttpContextInitialized = true;
    return this;
  }

  private resolveAndBindHttpContext(req: Request, res: Response): HttpContext {
    const context = container.resolve(HttpContext);
    HttpContextBinder.fromExpress(context, req, res);
    return context;
  }

  useRequestHandler<TRequestHandler extends RequestHandler<any>>(
    requestHandler: TRequestHandler | constructor<TRequestHandler>
  ): AppBuilder {
    this.logger.debug(`.${this.useRequestHandler.name}`, {
      requestHandler: requestHandler,
    });

    if (!this.isHttpContextInitialized) {
      throw new Error(
        `The ${HttpContext.name} singleton has not been initialized. Please use the ${this.useHttpContext.name} method before calling ${this.useRequestHandler.name}.`
      );
    }

    if (requestHandler instanceof RequestHandler) {
      this.registerRequestHandler<TRequestHandler>(requestHandler);
    } else {
      container.register(requestHandler.name, requestHandler);
      const requestHandlerInstance = container.resolve(requestHandler);
      this.registerRequestHandler<TRequestHandler>(requestHandlerInstance);
    }

    return this;
  }

  private registerRequestHandler<TRequestHandler extends RequestHandler<any>>(
    requestHandler: TRequestHandler
  ) {
    this.app[requestHandler._method](
      requestHandler._path,
      ...ExpressRequestHandlerFactory.fromMiddlewares(requestHandler.onBeforeMiddlewares),
      async (req: Request, res: Response) => {
        const httpContext = this.resolveAndBindHttpContext(req, res); // TODO Figure out a way to do this only in the .useHttpContext method
        const customResponse = await RequestHandlerResolver.handleAsync<TRequestHandler>(
          requestHandler,
          httpContext
        );
        return RequestHandlerResponseAdapter.toExpressResponse(res, customResponse);
      }
    );
  }

  /* #endregion */

  /* #region CQRS */

  useCommandHandler(commandHandlerClass: any): AppBuilder {
    container.register(commandHandlerClass.name, commandHandlerClass);
    return this;
  }

  useQueryHandler(queryHandlerClass: any): AppBuilder {
    container.register(queryHandlerClass.name, queryHandlerClass);
    return this;
  }

  useEventHandler(eventHandlerClass: any): AppBuilder {
    container.register(eventHandlerClass.name, eventHandlerClass);
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
  build() {
    const server = this.app
      .listen(environment.api.port, () => {
        this.logger.debug("App built successfully!");
        this.logger.info("Server address:", server.address());
      })
      .on("error", (err) => {
        this.logger.error(err.message);
        throw err;
      });

    return server;
  }

  // TODO Add return type
  buildAsync(port: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const server = this.app
        .listen(port, () => {
          this.logger.debug("App built successfully!");
          this.logger.info("Server address:", server.address());
          return resolve(server);
        })
        .on("error", (err) => {
          this.logger.error(err.message);
          return reject(err);
        });
    });
  }

  /* #endregion */
}
