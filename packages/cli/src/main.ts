#! /usr/bin/env node

import "reflect-metadata";
import { ServiceContainerBuilder } from "@tomasjs/core";
import { UseInfrastructure } from "./infrastructure";
import { MainCommand } from "./application/services/commander";
import { UseApplication } from "./application";

async function main() {
  const services = await new ServiceContainerBuilder()
    .setup(new UseApplication())
    .setup(new UseInfrastructure())
    .buildServiceProviderAsync();

  const mainCommand = services.get(MainCommand);
  const app = mainCommand.create();
  app.parse();
}

main();
