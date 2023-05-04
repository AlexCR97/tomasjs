import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { GuardType } from "./GuardType";
import { Logger } from "@tomasjs/logging";
import { Container } from "@tomasjs/core";
import { Express } from "express";
import { GuardAdapter } from "./GuardAdapter";

export class UseGuard implements AppSetupFactory {
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
      for (const guard of this.guards) {
        this.bootstrapIntoHttpPipeline(app, container, guard);
      }
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
