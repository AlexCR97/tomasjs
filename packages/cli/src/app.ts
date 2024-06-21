#! /usr/bin/env node

import "reflect-metadata";
import { ConsoleAppBuilder, IEntryPoint } from "@tomasjs/core/console";
import { InitCommand, MainCommand } from "./commands";
import { inject } from "@tomasjs/core/dependency-injection";
import {
  PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN,
  ProjectTemplateDownloaderFactory,
} from "./templates/ProjectTemplateDownloaderFactory";

class Main implements IEntryPoint {
  constructor(@inject(MainCommand) private readonly command: MainCommand) {}

  main(args: string[]): void | Promise<void> {
    this.command.createCommand().parse(process.argv);
  }
}

new ConsoleAppBuilder()
  .setupConfiguration((config) => config.addJsonSource())
  .setupContainer((container) => {
    container
      .add("singleton", MainCommand)
      .add("singleton", InitCommand)
      .add(
        "singleton",
        PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN,
        ProjectTemplateDownloaderFactory
      );
  })
  .addEntryPoint(Main)
  .build()
  .then((app) => app.start());
