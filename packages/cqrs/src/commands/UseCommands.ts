import {
  ClassConstructor,
  Container,
  ContainerSetupFactory,
  ContainerSetupFunction,
} from "@tomasjs/core";
import { CommandDispatcher } from "./CommandDispatcher";
import { commandHandlerToken } from "./commandHandlerToken";

export class UseCommands implements ContainerSetupFactory {
  constructor(private readonly commandHandlers?: ClassConstructor<any>[]) {}

  private get handlers(): ClassConstructor<any>[] {
    return this.commandHandlers ?? [];
  }

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(CommandDispatcher);
      this.registerHandlers(container);
    };
  }

  private registerHandlers(container: Container) {
    for (const handler of this.handlers) {
      container.addClass(handler, { token: commandHandlerToken });
    }
  }
}
