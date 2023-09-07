import { Container, TomasLogger } from "@tomasjs/core";
import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { Express } from "express";
import { InterceptorAdapter } from "./InterceptorAdapter";
import { InterceptorType } from "./InterceptorType";

export class UseInterceptors implements AppSetupFactory {
  private readonly interceptors: InterceptorType[];
  private readonly logger = new TomasLogger(UseInterceptors.name, "debug");

  constructor(options: { interceptors?: InterceptorType[] }) {
    this.interceptors = options.interceptors ?? [];
  }

  create(): AppSetupFunction {
    return (app, container) => {
      this.logger.debug("Bootstrapping interceptors...");

      for (const interceptor of this.interceptors) {
        this.bootstrapIntoHttpPipeline(app, container, interceptor);
      }

      this.logger.debug("Successfully bootstrapped interceptors");
    };
  }

  private bootstrapIntoHttpPipeline(
    app: Express,
    container: Container,
    interceptor: InterceptorType
  ) {
    this.logger.debug(`Bootstrapping interceptor "${interceptor}..."`);

    const adapter = new InterceptorAdapter(container, interceptor);

    const expressMiddlewareFunction = adapter.adapt();

    app.use(expressMiddlewareFunction);

    this.logger.debug(`Successfully bootstrapped interceptor "${interceptor}"`);
  }
}
