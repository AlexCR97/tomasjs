#! /usr/bin/env node

import "reflect-metadata";
import { ConsoleAppBuilder, IEntryPoint } from "@tomasjs/core/app";
import { InitCommand, MainCommand } from "./commands";
import {
  GoogleDriveTemplateDownloader,
  LocalTemplateDownloader,
  MegaTemplateDownloader,
  PROJECT_TEMPLATE_DOWNLOADER,
} from "./templates";
import { inject } from "@tomasjs/core/dependency-injection";

class Main implements IEntryPoint {
  constructor(@inject(MainCommand) private readonly command: MainCommand) {}

  main(args: string[]): void | Promise<void> {
    this.command.createCommand().parse(process.argv);
  }
}

new ConsoleAppBuilder()
  .setupContainer((container) => {
    container
      .add("singleton", MainCommand)
      .add("singleton", InitCommand)
      // .add("singleton", PROJECT_TEMPLATE_DOWNLOADER, LocalTemplateDownloader)
      // .add("singleton", PROJECT_TEMPLATE_DOWNLOADER, GoogleDriveTemplateDownloader)
      .add("singleton", PROJECT_TEMPLATE_DOWNLOADER, MegaTemplateDownloader);
  })
  .addEntryPoint(Main)
  .build()
  .then((app) => app.start());
