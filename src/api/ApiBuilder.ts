import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { environment } from "@/environment";
import express, { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "./controllers/core";
import { ActionHandler, AsyncActionHandler } from "./controllers/core/types";
import { AsyncMiddleware, ErrorMiddleware, Middleware } from "./middleware/core";

@injectable()
export class ApiBuilder {
  private readonly logger: ILogger;
  private readonly app: express.Express;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    this.logger = this.loggerProvider.createLogger(ApiBuilder.name);
    this.logger.debug("Initializing api...");

    this.app = express();

    this.app.use(
      express.json({
        type: "*/*", // TODO is this needed?
      })
    );
  }

  private basePath?: string;
  useBasePath(basePath: string): ApiBuilder {
    this.basePath = basePath;
    return this;
  }

  useController<TController extends BaseController>(controller: TController): ApiBuilder {
    this.logger.debug(`Registering controller ${controller.route}`);

    if (controller.actions.length === 0) {
      return this;
    }

    const router = express.Router();

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

      return router[action.method](
        action.path,
        middleware,
        async (req: express.Request, res: express.Response) => {
          const handlerResponse = handler(req, res);
          await Promise.resolve(handlerResponse);
        }
      );
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

  useMiddleware(middleware: Middleware | AsyncMiddleware | ErrorMiddleware): ApiBuilder {
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

  build() {
    const server = this.app
      .listen(environment.api.port, () => {
        this.logger.debug("Initialized api successfully!");
        this.logger.debug("Server address:", server.address());
      })
      .on("error", (err) => {
        this.logger.error(err.message);
        throw err;
      });
  }
}
