import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { GuardType } from "./GuardType";
import { Container, Logger, TomasLogger } from "@tomasjs/core";
import { Express } from "express";
import { GuardAdapter } from "./GuardAdapter";

export class UseGuards implements AppSetupFactory {
  private readonly logger: Logger = new TomasLogger(UseGuards.name, "error");
  private readonly guards: GuardType[];

  constructor(options: { guards?: GuardType[] }) {
    this.guards = options.guards ?? [];
  }

  create(): AppSetupFunction {
    return (app, container) => {
      this.logger.debug("Bootstrapping guards ...");

      for (const guard of this.guards) {
        this.bootstrapIntoHttpPipeline(app, container, guard);
      }

      this.logger.debug("Guards bootstrapped.");
    };
  }

  private bootstrapIntoHttpPipeline(app: Express, container: Container, guard: GuardType) {
    const adapter = new GuardAdapter({
      container,
      guard,
    });

    const middlewareFunction = adapter.adapt();

    app.use(middlewareFunction);
  }
}
