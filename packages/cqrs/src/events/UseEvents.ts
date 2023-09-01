import {
  ClassConstructor,
  Container,
  ContainerSetupFactory,
  ContainerSetupFunction,
} from "@tomasjs/core";
import { EventDispatcher } from "./EventDispatcher";
import { eventHandlerToken } from "./eventHandlerToken";

export class UseEvents implements ContainerSetupFactory {
  constructor(private readonly eventHandlers?: ClassConstructor<any>[]) {}

  private get handlers(): ClassConstructor<any>[] {
    return this.eventHandlers ?? [];
  }

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(EventDispatcher);
      this.registerHandlers(container);
    };
  }

  private registerHandlers(container: Container) {
    for (const handler of this.handlers) {
      container.addClass(handler, { token: eventHandlerToken });
    }
  }
}
