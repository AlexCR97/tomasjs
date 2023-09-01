import {
  ClassConstructor,
  ServiceProvider,
  TomasError,
  getConstructorOf,
  inject,
  injectable,
  serviceProviderToken,
} from "@tomasjs/core";
import { EventHandler } from "./EventHandler";
import { eventHandlerToken } from "./eventHandlerToken";
import { EventHandlerMetadata } from "./EventHandlerMetadata";

@injectable()
export class EventDispatcher {
  constructor(@inject(serviceProviderToken) private readonly services: ServiceProvider) {}

  emit<TEvent>(event: TEvent): void {
    const eventConstructor = getConstructorOf<TEvent>(event);
    const eventHandler = this.getHandlerFor<TEvent>(eventConstructor);
    eventHandler.handle(event);
  }

  private getHandlerFor<TEvent>(eventConstructor: ClassConstructor<TEvent>): EventHandler<TEvent> {
    const eventHandlers = this.services.getAll<EventHandler<TEvent>>(eventHandlerToken);

    const matchingEventHandler = eventHandlers.find((eh) => {
      const metadata = new EventHandlerMetadata(eh);
      return metadata.eventConstructor === eventConstructor;
    });

    if (!matchingEventHandler) {
      throw new TomasError("Could not find an EventHandler for the dispatched event.", {
        data: { eventConstructor },
      });
    }

    return matchingEventHandler;
  }
}
