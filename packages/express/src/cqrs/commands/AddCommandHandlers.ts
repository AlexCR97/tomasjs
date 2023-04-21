import { ClassConstructor, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { CommandHandlerToken } from "./metadata";

export class AddCommandHandlers extends ContainerSetupFactory {
  constructor(private readonly commandHandlers: ClassConstructor<any>[]) {
    super();
  }

  create(): ContainerSetup {
    return (container) => {
      if (!this.commandHandlers) {
        return;
      }

      if (this.commandHandlers.length === 0) {
        return;
      }

      for (const handler of this.commandHandlers) {
        container.addClass(handler, { token: CommandHandlerToken });
      }
    };
  }
}
