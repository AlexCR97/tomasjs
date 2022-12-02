import { DefaultLogger } from "@/core/logger";
import { RequestContext } from "@/@thomas/requests";
import { environment } from "@/environment";
import express, { json, Express, NextFunction, Request, Response, Router } from "express";
import { container, DependencyContainer } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { AsyncMiddleware, ErrorMiddleware, Middleware } from "@/@thomas/middleware";
import { ActionHandler, AsyncActionHandler } from "@/@thomas/controllers/types";
import { BaseController, Controller } from "@/@thomas/controllers";
import { HttpMethod } from "../HttpMethod";
import { OnBeforeMiddleware } from "./types";
import {
  ExpressRequestHandlerFactory,
  RequestHandlerResolver,
  RequestHandlerResponseAdapter,
} from "./requests";
import { ActionMap } from "../controllers/Controller";

export class AppBuilder {
  private readonly app: Express;
  private readonly logger = new DefaultLogger(AppBuilder.name, { level: "info" });

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

  useMiddleware(middlewareClass: any): AppBuilder {
    container.register(middlewareClass.name, middlewareClass);
    const middleware = container.resolve(middlewareClass) as any;

    if (middleware instanceof Middleware) {
      this.app.use((req: Request, res: Response, next: NextFunction) =>
        middleware.handle(req, res, next)
      );
    } else if (middleware instanceof AsyncMiddleware) {
      this.app.use(
        async (req: Request, res: Response, next: NextFunction) =>
          await middleware.handleAsync(req, res, next)
      );
    } else if (middleware instanceof ErrorMiddleware) {
      this.app.use((err: any, req: Request, res: Response, next: NextFunction) =>
        middleware.handle(err, req, res, next)
      );
    }

    return this;
  }

  /* #endregion */

  /* #region Controllers */

  private controllersBasePath?: string;

  useControllersBasePath(basePath: string): AppBuilder {
    this.logger.debug(`.${this.useControllersBasePath.name}`, { basePath });
    this.controllersBasePath = basePath;
    return this;
  }

  useController(controllerClass: any): AppBuilder {
    this.logger.debug(`.${this.useController.name}`, { controllerClass });

    container.register(controllerClass.name, controllerClass);
    const controller = container.resolve(controllerClass) as BaseController;

    this.logger.debug(`Registering controller ${controller.route}`);

    if (controller.actions.length === 0) {
      return this;
    }

    const router = Router();

    controller.actions.forEach((action) => {
      const actionStr = `[${action.method}] ${action.path} (${action.handlers.length} handlers)`;
      this.logger.debug(`Registering controller action: ${actionStr}`);

      if (action.handlers.length == 0) {
        return;
      }

      if (action.handlers.length == 1) {
        return router[action.method](action.path, async (req, res) => {
          const actionHandler = action.handlers[0] as ActionHandler | AsyncActionHandler;
          const handlerResponse = actionHandler(req, res);
          await Promise.resolve(handlerResponse);
        });
      }

      const middleware = action.handlers.slice(0, action.handlers.length - 1);

      const handler = action.handlers[action.handlers.length - 1] as
        | ActionHandler
        | AsyncActionHandler;

      return router[action.method](action.path, middleware, async (req: Request, res: Response) => {
        const handlerResponse = handler(req, res);
        await Promise.resolve(handlerResponse);
      });
    });

    if (
      this.controllersBasePath === undefined ||
      this.controllersBasePath === null ||
      this.controllersBasePath.trim().length === 0
    ) {
      this.app.use(`/${controller.route}`, router);
    } else {
      this.app.use(`/${this.controllersBasePath}/${controller.route}`, router);
    }

    this.logger.debug(`Registered [${controller.route}] controller successfully\n`);

    return this;
  }

  useControllerx<TController extends Controller>(
    controllerConstructor: constructor<TController>
  ): AppBuilder {
    this.logger.debug(`.${this.useControllerx.name}`, { controllerConstructor });

    container.register(controllerConstructor.name, controllerConstructor);
    const controllerInstance = container.resolve(controllerConstructor);
    const controllerActions: ActionMap<any>[] = (controllerInstance as any).actions;

    if (
      controllerActions === undefined ||
      controllerActions === null ||
      controllerActions.length === 0
    ) {
      return this;
    }

    for (const action of controllerActions) {
      const path = `/${controllerInstance.route}${action.path}`;
      this.app[action.method](path, async (req, res) => {
        const requestContext = this.resolveAndBindRequestContext(req);
        const actionResponse = await action.handler(requestContext); // TODO Will this action work with DI?
        return RequestHandlerResponseAdapter.toExpressResponse(res, actionResponse);
      });
    }

    return this;
  }

  /* #endregion */

  /* #region Request Handlers */

  private isRequestContextInitialized = false;

  useRequestContext(): AppBuilder {
    this.app.use((req, res, next) => {
      this.resolveAndBindRequestContext(req);
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
        const requestContext = this.resolveAndBindRequestContext(req); // TODO Figure out a way to do this only in the .useRequestContext method
        const customResponse = await RequestHandlerResolver.resolveAndHandleAsync<any, any>(
          requestHandlerConstructor,
          requestContext
        );
        return RequestHandlerResponseAdapter.toExpressResponse(res, customResponse);
      }
    );

    return this;
  }

  private resolveAndBindRequestContext(req: Request): RequestContext {
    const context = container.resolve(RequestContext);

    // Since RequestContext properties are readonly, use "any" to bypass TypeScript compiler
    (context as any).path = req.path;
    (context as any).headers = req.headers;
    (context as any).params = req.params;
    (context as any).query = req.query;
    (context as any).body = req.body;

    return context;
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
}
