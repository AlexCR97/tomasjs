import { DefaultLogger } from "@/core/logger";
import { environment } from "@/environment";
import express, { json, Express, NextFunction, Request, Response, Router, text } from "express";
import { container, DependencyContainer } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { HttpMethod } from "../HttpMethod";
import { OnBeforeMiddleware } from "./types";
import {
  ExpressRequestHandlerFactory,
  RequestHandlerResolver,
  RequestHandlerResponseAdapter,
} from "./requests";
import { ErrorMiddleware, Middleware } from "@/middleware";
import { Controller } from "@/controllers";
import { ControllerActionMap, ControllerMiddleware } from "@/controllers/types";
import { HttpContext } from "@/core";
import { RequestHandler } from "@/requests";
import { HttpContextBinder } from "@/core/HttpContextBinder";

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
    const controllerInstanceAny = controllerInstance as any;
    const onBeforeMiddlewares: ControllerMiddleware[] = controllerInstanceAny.onBeforeMiddleware;
    const controllerActions: ControllerActionMap<any>[] = controllerInstanceAny.actions;

    if (
      onBeforeMiddlewares !== undefined &&
      onBeforeMiddlewares !== null &&
      onBeforeMiddlewares.length > 0
    ) {
      onBeforeMiddlewares.forEach((middleware) => {
        this.useMiddlewareRouter(router, middleware);
      });
    }

    if (
      controllerActions !== undefined &&
      controllerActions !== null &&
      controllerActions.length > 0
    ) {
      for (const action of controllerActions) {
        router[action.method](action.path, async (req, res) => {
          const httpContext = this.resolveAndBindHttpContext(req, res);
          const actionResponse = await action.handler(httpContext); // TODO Will this action work with DI?
          return RequestHandlerResponseAdapter.toExpressResponse(res, actionResponse);
        });
      }
    }

    return router;
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
    method: HttpMethod,
    path: string,
    requestHandler: TRequestHandler | constructor<TRequestHandler>,
    options?: {
      onBefore?: OnBeforeMiddleware | OnBeforeMiddleware[];
    }
  ): AppBuilder {
    this.logger.debug(`.${this.useRequestHandler.name}`, {
      method,
      path,
      requestHandlerConstructor: requestHandler,
    });

    if (!this.isHttpContextInitialized) {
      throw new Error(
        `The ${HttpContext.name} singleton has not been initialized. Please use the ${this.useHttpContext.name} method before calling ${this.useRequestHandler.name}.`
      );
    }

    if (requestHandler instanceof RequestHandler) {
      this.registerRequestHandler<TRequestHandler>(method, path, requestHandler, options);
    } else {
      container.register(requestHandler.name, requestHandler);
      const requestHandlerInstance = container.resolve(requestHandler);
      this.registerRequestHandler<TRequestHandler>(method, path, requestHandlerInstance, options);
    }

    return this;
  }

  private registerRequestHandler<TRequestHandler extends RequestHandler<any>>(
    method: HttpMethod,
    path: string,
    requestHandler: TRequestHandler,
    options?: {
      onBefore?: OnBeforeMiddleware | OnBeforeMiddleware[];
    }
  ) {
    this.app[method](
      path,
      ...ExpressRequestHandlerFactory.fromMiddlewares(options?.onBefore),
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
