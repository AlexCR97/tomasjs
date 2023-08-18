import {
  ClassConstructor,
  Container,
  ContainerSetupFactory,
  ContainerSetupFunction,
} from "@tomasjs/core";
import { EventDispatcher } from "./EventDispatcher";
import { EventHandlerToken } from "./metadata";

export class UseEvents implements ContainerSetupFactory {
  constructor(private readonly eventHandlers?: ClassConstructor<any>[]) {}

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(EventDispatcher);
      this.registerHandlers(container);
    };
  }

  private registerHandlers(container: Container) {
    if (!this.eventHandlers) {
      return;
    }

    if (this.eventHandlers.length === 0) {
      return;
    }

    for (const handler of this.eventHandlers) {
      container.addClass(handler, { token: EventHandlerToken });
    }
  }
}
