import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { GuardType } from "./GuardType";
import { Container, Logger } from "@tomasjs/core";
import { Express } from "express";
import { GuardAdapter } from "./GuardAdapter";

export class UseGuards implements AppSetupFactory {
  constructor(
    private readonly options: {
      guards?: GuardType[];
      logger?: Logger;
    }
  ) {}

  private get guards(): GuardType[] {
    return this.options.guards ?? [];
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): AppSetupFunction {
    return (app, container) => {
      this.logger?.debug("Bootstrapping guards ...");

      for (const guard of this.guards) {
        this.bootstrapIntoHttpPipeline(app, container, guard);
      }

      this.logger?.debug("Guards bootstrapped.");
    };
  }

  private bootstrapIntoHttpPipeline(app: Express, container: Container, guard: GuardType) {
    const adapter = new GuardAdapter({
      container,
      guard,
      logger: this.logger,
    });

    const middlewareFunction = adapter.adapt();

    app.use(middlewareFunction);
  }
}
