import { DefaultLogger } from "@/core/logger";
import { AsyncRequestHandler, RequestContext, RequestHandler } from "@/core/requests/core";
import {
  JsonResponse,
  PlainTextResponse,
  StatusCodeResponse,
} from "@/core/requests/core/responses";
import { BaseResponse } from "@/core/requests/core/responses/BaseResponse";
import { environment } from "@/environment";
import express, { json, Express, NextFunction, Request, Response, Router } from "express";
import { container, DependencyContainer } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { BaseController } from "./controllers/core";
import { ActionHandler, AsyncActionHandler, HttpMethod } from "./controllers/core/types";
import { StatusCodes } from "./core";
import { AsyncMiddleware, ErrorMiddleware, Middleware } from "./middleware/core";

export class AppBuilder {
  private readonly app: Express;
  private readonly logger = new DefaultLogger(AppBuilder.name, { level: "info" });
  private controllersBasePath?: string;
  private isRequestContextInitialized = false;

  constructor() {
    this.logger.debug("Building app...");
    this.app = express();
  }

  register(containerSetup: (container: DependencyContainer) => void): AppBuilder {
    containerSetup(container);
    return this;
  }

  use(appSetup: (app: Express) => void): AppBuilder {
    appSetup(this.app);
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

  useRequestContext(): AppBuilder {
    this.app.use((req, res, next) => {
      const requestContext = container.resolve(RequestContext);
      this.bindRequestContext(requestContext, req);
      next();
    });
    this.isRequestContextInitialized = true;
    return this;
  }

  useRequestHandler<T>(
    method: HttpMethod,
    path: string,
    requestHandlerClass: constructor<T>
  ): AppBuilder {
    this.logger.debug(`.${this.useRequestHandler.name}`, { method, path, requestHandlerClass });

    if (!this.isRequestContextInitialized) {
      throw new Error(
        `The ${RequestContext.name} singleton has not been initialized. Please use the ${this.useRequestContext.name} method before calling ${this.useRequestHandler.name}.`
      );
    }

    container.register(requestHandlerClass.name, requestHandlerClass);

    this.app[method](path, async (req: Request, res: Response) => {
      const requestContext = container.resolve(RequestContext);
      this.bindRequestContext(requestContext, req); // TODO Figure out a way to do this only in the .useRequestContext method

      const requestHandler = container.resolve(requestHandlerClass) as
        | RequestHandler<any>
        | AsyncRequestHandler<any>;
      const syncRequestHandler = requestHandler as RequestHandler<any>;
      const asyncRequestHandler = requestHandler as AsyncRequestHandler<any>;
      let handlerResponse: any;

      if (syncRequestHandler.handle !== undefined) {
        handlerResponse = syncRequestHandler.handle(requestContext);
      } else if (asyncRequestHandler.handleAsync !== undefined) {
        handlerResponse = await asyncRequestHandler.handleAsync(requestContext);
      } else {
        throw new Error(
          `Could not convert provided request handler into a valid ${RequestHandler.name} or ${AsyncRequestHandler.name}.`
        );
      }

      if (handlerResponse instanceof BaseResponse) {
        const defaultStatusCode = StatusCodes.ok;

        if (handlerResponse instanceof JsonResponse) {
          return res
            .status(handlerResponse.status ?? defaultStatusCode)
            .json(handlerResponse.data)
            .send();
        }

        if (handlerResponse instanceof PlainTextResponse) {
          return res.status(handlerResponse.status ?? defaultStatusCode).send(handlerResponse.data);
        }

        if (handlerResponse instanceof StatusCodeResponse) {
          return res.sendStatus(handlerResponse.status ?? defaultStatusCode);
        }
      }

      if (handlerResponse !== undefined) {
        return res.send(handlerResponse);
      }

      return res.send();
    });

    return this;
  }

  useQueryHandler(queryHandlerClass: any): AppBuilder {
    container.register(queryHandlerClass.name, queryHandlerClass);
    return this;
  }

  useCommandHandler(commandHandlerClass: any): AppBuilder {
    container.register(commandHandlerClass.name, commandHandlerClass);
    return this;
  }

  useEventHandler(eventHandlerClass: any): AppBuilder {
    container.register(eventHandlerClass.name, eventHandlerClass);
    return this;
  }

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

  useSpa(options: { spaPath: string }): AppBuilder {
    this.app.use(express.static(options.spaPath));

    this.app.get("/*", (req, res) => {
      const spaIndexFile = `${options.spaPath}/index.html`;
      res.sendFile(spaIndexFile);
    });

    return this;
  }

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

  private bindRequestContext(context: RequestContext, req: Request) {
    // Since RequestContext properties are readonly, use "any" to bypass TypeScript compiler
    (context as any).path = req.path;
    (context as any).headers = req.headers;
    (context as any).params = req.params;
    (context as any).query = req.query;
    (context as any).body = req.body;
  }
}
