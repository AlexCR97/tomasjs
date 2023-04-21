import { ClassConstructor, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { EventHandlerToken } from "./metadata";

export class AddEventHandlers extends ContainerSetupFactory {
  constructor(private readonly eventHandlers: ClassConstructor<any>[]) {
    super();
  }

  create(): ContainerSetup {
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
