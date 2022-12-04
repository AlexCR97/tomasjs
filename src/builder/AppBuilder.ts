import { DefaultLogger } from "@/core/logger";
import { environment } from "@/environment";
import express, { json, Express, NextFunction, Request, Response, Router } from "express";
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
import { HttpContext, RequestContext } from "@/core";

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
          const requestContext = this.resolveAndBindHttpContext(req, res);
          const actionResponse = await action.handler(requestContext); // TODO Will this action work with DI?
          return RequestHandlerResponseAdapter.toExpressResponse(res, actionResponse);
        });
      }
    }

    return router;
  }

  /* #endregion */

  /* #region Request Handlers */

  private isRequestContextInitialized = false;

  useRequestContext(): AppBuilder {
    this.app.use((req, res, next) => {
      this.resolveAndBindHttpContext(req, res);
      next();
    });
    this.isRequestContextInitialized = true;
    return this;
  }

  useRequestHandler(
    method: HttpMethod,
    path: string,
    requestHandlerConstructor: constructor<any>,
    options?: {
      onBefore?: OnBeforeMiddleware | OnBeforeMiddleware[];
    }
  ): AppBuilder {
    this.logger.debug(`.${this.useRequestHandler.name}`, {
      method,
      path,
      requestHandlerConstructor,
    });

    if (!this.isRequestContextInitialized) {
      throw new Error(
        `The ${RequestContext.name} singleton has not been initialized. Please use the ${this.useRequestContext.name} method before calling ${this.useRequestHandler.name}.`
      );
    }

    container.register(requestHandlerConstructor.name, requestHandlerConstructor);

    this.app[method](
      path,
      ...ExpressRequestHandlerFactory.fromMiddlewares(options?.onBefore),
      async (req: Request, res: Response) => {
        const requestContext = this.resolveAndBindHttpContext(req, res); // TODO Figure out a way to do this only in the .useRequestContext method
        const customResponse = await RequestHandlerResolver.resolveAndHandleAsync<any, any>(
          requestHandlerConstructor,
          requestContext
        );
        return RequestHandlerResponseAdapter.toExpressResponse(res, customResponse);
      }
    );

    return this;
  }

  private resolveAndBindHttpContext(req: Request, res: Response): HttpContext {
    const context = container.resolve(RequestContext);

    // Since RequestContext properties are readonly, use "any" to bypass TypeScript compiler
    const contextAny = context as any;

    // Request
    contextAny.path = req.path;
    contextAny.headers = req.headers;
    contextAny.params = req.params;
    contextAny.query = req.query;
    contextAny.body = req.body;

    // Response
    contextAny.response = res;

    return contextAny;
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
