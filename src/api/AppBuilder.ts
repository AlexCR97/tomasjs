import { DefaultLogger } from "@/core/logger";
import { environment } from "@/environment";
import express, { json, Express, NextFunction, Request, Response, Router } from "express";
import { container, DependencyContainer } from "tsyringe";
import { BaseController } from "./controllers/core";
import { ActionHandler, AsyncActionHandler } from "./controllers/core/types";
import { AsyncMiddleware, ErrorMiddleware, Middleware } from "./middleware/core";

export class AppBuilder {
  private readonly app: Express;
  private readonly logger = new DefaultLogger(AppBuilder.name, { level: "info" });
  private basePath?: string;

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

  useBasePath(basePath: string): AppBuilder {
    this.logger.debug(`.${this.useBasePath.name}`, { basePath });
    this.basePath = basePath;
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
      this.basePath === undefined ||
      this.basePath === null ||
      this.basePath.trim().length === 0
    ) {
      this.app.use(`/${controller.route}`, router);
    } else {
      this.app.use(`/${this.basePath}/${controller.route}`, router);
    }

    this.logger.debug(`Registered [${controller.route}] controller successfully\n`);

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
}
