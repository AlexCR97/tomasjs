import { ClassConstructor, ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { EventHandlerToken } from "./metadata";

export class AddEventHandlers implements ContainerSetupFactory {
  constructor(private readonly eventHandlers: ClassConstructor<any>[]) {}

  create(): ContainerSetupFunction {
    return (container) => {
      if (!this.eventHandlers) {
        return;
      }

      if (this.eventHandlers.length === 0) {
        return;
      }

      for (const handler of this.eventHandlers) {
        container.addClass(handler, { token: EventHandlerToken });
      }
    };
  }
}
