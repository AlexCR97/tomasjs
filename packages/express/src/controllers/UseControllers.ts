import { ClassConstructor, Container } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";
import { Express } from "express";
import { AppSetupFactory } from "@/builder/AppSetupFactory";
import { AppSetupFunction } from "@/builder/AppSetupFunction";
import { Controller } from "./Controller";
import { ControllerMetadata } from "./metadata";
import { ControllerAdapter } from "./ControllerAdapter";
import { ExpressPathNormalizer } from "@/core/express";

interface UseControllersOptions {
  controllers?: ClassConstructor<Controller>[];
  logger?: Logger;
}

export class UseControllers implements AppSetupFactory {
  constructor(private readonly options: UseControllersOptions) {}

  private get controllers(): ClassConstructor<Controller>[] {
    return this.options.controllers ?? [];
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): AppSetupFunction {
    return (app, container) => {
      this.logger?.debug("Bootstrapping controllers ...");

      if (this.controllers.length === 0) {
        this.logger?.debug("No controllers to bootstrap.");
        return;
      }

      for (const controller of this.controllers) {
        this.bootstrapController(app, container, controller);
      }

      this.logger?.debug("Controllers bootstrapped.");
    };
  }

  private bootstrapController(
    app: Express,
    container: Container,
    controller: ClassConstructor<Controller>
  ) {
    this.logger?.debug(`Bootstrapping controller ${controller.name} ...`);
    const resolvedController = this.bootstrapControllerToContainer(container, controller);
    this.bootstrapControllerToHttpPipeline(app, container, resolvedController);
    this.logger?.debug(`Controller ${controller.name} has been successfully bootstrapped.`);
  }

  private bootstrapControllerToContainer(
    container: Container,
    controller: ClassConstructor<Controller>
  ) {
    this.logger?.debug(`Bootstrapping to container ...`);
    container.addClass(controller);
    const resolvedController = container.get<Controller>(controller);
    this.logger?.debug(`Controller successfully bootstrapped to container.`);
    return resolvedController;
  }

  private bootstrapControllerToHttpPipeline(
    app: Express,
    container: Container,
    controller: Controller
  ) {
    this.logger?.debug(`Bootstrapping to http pipeline ...`);
    const controllerMetadata = new ControllerMetadata(controller);
    const expressRouterPath = new ExpressPathNormalizer(controllerMetadata.path).normalize();
    const expressRouter = new ControllerAdapter({
      container,
      controller,
      logger: this.logger,
    }).adapt();
    app.use(expressRouterPath, expressRouter);
    this.logger?.debug(`Controller successfully bootstrapped to http pipeline.`);
    return this;
  }
}
