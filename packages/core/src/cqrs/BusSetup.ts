import { ContainerSetup } from "@/dependency-injection";
import { Bus } from "./Bus";
import { Constructor } from "@/system";
import { REQUEST_HANDLERS } from "./RequestHandler";
import { EVENT_HANDLERS } from "./EventHandler";

export class BusSetup {
  private readonly requestHandlers: Constructor<unknown>[] = [];
  private readonly eventHandlers: Constructor<unknown>[] = [];

  addRequestHandlers(...handlers: Constructor<unknown>[]): BusSetup {
    this.requestHandlers.push(...handlers);
    return this;
  }

  addEventHandlers(...handlers: Constructor<unknown>[]): BusSetup {
    this.eventHandlers.push(...handlers);
    return this;
  }

  build(): ContainerSetup {
    return (container) => {
      container.add("singleton", Bus);

      for (const handler of this.requestHandlers) {
        container.add("scoped", REQUEST_HANDLERS, handler);
      }

      for (const handler of this.eventHandlers) {
        container.add("scoped", EVENT_HANDLERS, handler);
      }
    };
  }
}
