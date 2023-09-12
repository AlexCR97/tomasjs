import { Container, TomasLogger } from "@tomasjs/core";
import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { Express } from "express";
import { MiddlewareAdapter } from "./MiddlewareAdapter";
import { MiddlewareType } from "./MiddlewareType";

export class UseMiddlewares implements AppSetupFactory {
  private readonly middlewares: MiddlewareType[];
  private readonly logger = new TomasLogger(UseMiddlewares.name, "debug");

  constructor(options: { middlewares?: MiddlewareType[] }) {
    this.middlewares = options.middlewares ?? [];
  }

  create(): AppSetupFunction {
    return (app, container) => {
      this.logger.debug("Bootstrapping middlewares...");

      for (const middleware of this.middlewares) {
        this.bootstrapIntoHttpPipeline(app, container, middleware);
      }

      this.logger.debug("Successfully bootstrapped middlewares");
    };
  }

  private bootstrapIntoHttpPipeline(
    app: Express,
    container: Container,
    middleware: MiddlewareType
  ) {
    this.logger.debug(`Bootstrapping middleware "${middleware}..."`);

    const adapter = new MiddlewareAdapter({
      container,
      middleware,
    });

    const expressMiddlewareFunction = adapter.adapt();

    app.use(expressMiddlewareFunction);

    this.logger.debug(`Successfully bootstrapped middleware "${middleware}"`);
  }
}
