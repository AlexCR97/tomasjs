import { ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { InitCommand, MainCommand } from "./services/commander";
import { ZipService } from "./services";

export class UseApplication implements ContainerSetupFactory {
  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(ZipService).addClass(MainCommand).addClass(InitCommand);
    };
  }
}
