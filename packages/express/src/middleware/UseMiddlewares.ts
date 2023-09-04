import { Express } from "express";
import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { MiddlewareType } from "./MiddlewareType";
import { Container, Logger } from "@tomasjs/core";
import { MiddlewareAdapter } from "./MiddlewareAdapter";

export class UseMiddlewares implements AppSetupFactory {
  constructor(
    private readonly options: {
      middlewares?: MiddlewareType[];
      logger?: Logger;
    }
  ) {}

  private get middlewares(): MiddlewareType[] {
    return this.options.middlewares ?? [];
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): AppSetupFunction {
    return (app, container) => {
      for (const middleware of this.middlewares) {
        this.bootstrapIntoHttpPipeline(app, container, middleware);
      }
    };
  }

  private bootstrapIntoHttpPipeline(
    app: Express,
    container: Container,
    middleware: MiddlewareType
  ) {
    const adapter = new MiddlewareAdapter({
      container,
      middleware,
      logger: this.logger,
    });

    const middlewareFunction = adapter.adapt();

    app.use(middlewareFunction);
  }
}
