import {
  ClassConstructor,
  Container,
  ContainerSetupFactory,
  ContainerSetupFunction,
} from "@tomasjs/core";
import { CommandDispatcher } from "./CommandDispatcher";
import { CommandHandlerToken } from "./metadata";

export class UseCommands implements ContainerSetupFactory {
  constructor(private readonly commandHandlers?: ClassConstructor<any>[]) {}

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(CommandDispatcher);
      this.registerHandlers(container);
    };
  }

  private registerHandlers(container: Container) {
    if (!this.commandHandlers) {
      return;
    }

    if (this.commandHandlers.length === 0) {
      return;
    }

    for (const handler of this.commandHandlers) {
      container.addClass(handler, { token: CommandHandlerToken });
    }
  }
}
