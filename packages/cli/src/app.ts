#! /usr/bin/env node

import "reflect-metadata";
import { ConsoleAppBuilder, IEntryPoint } from "@tomasjs/core/console";
import { BuildCommand, DevCommand, InitCommand, MainCommand, StartCommand } from "./commands";
import { IServiceProvider, inject } from "@tomasjs/core/dependency-injection";
import {
  PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN,
  ProjectTemplateDownloaderFactory,
} from "./templates/ProjectTemplateDownloaderFactory";
import { appconfig } from "./appconfig";
import { APP_LOGGER } from "./logger";
import { ILogger, ILoggerBuilder, LOGGER_BUILDER } from "@tomasjs/core/logging";

class Main implements IEntryPoint {
  constructor(@inject(MainCommand) private readonly command: MainCommand) {}

  main(args: string[]): void | Promise<void> {
    this.command.createCommand().parse(args);
  }
}

new ConsoleAppBuilder()
  .setupConfiguration((config) => config.addRawSource(appconfig))
  .setupContainer((container) => {
    container
      .add("singleton", MainCommand)
      .add("singleton", InitCommand)
      .add("singleton", BuildCommand)
      .add("singleton", DevCommand)
      .add("singleton", StartCommand)
      .add("singleton", PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN, ProjectTemplateDownloaderFactory)
      .add<ILogger>("singleton", APP_LOGGER, (services: IServiceProvider) => {
        return services
          .getOrThrow<ILoggerBuilder>(LOGGER_BUILDER)
          .withCategory("@tomasjs/cli")
          .withLevel("info")
          .build();
      });
  })
  .setupLogging((logging) =>
    logging.withConfiguration({
      minimumLevel: {
        default: "verbose",
      },
    })
  )
  .addEntryPoint(Main)
  .build()
  .then((app) => app.start());
