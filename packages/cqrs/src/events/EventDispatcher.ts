import { ClassConstructor, ServiceProvider, TomasError, getConstructorOf } from "@tomasjs/core";
import { EventHandler } from "./EventHandler";
import { EventHandlerMetadata, EventHandlerToken } from "./metadata";

export class EventDispatcher {
  constructor(private readonly services: ServiceProvider) {}

  emit<TEvent>(event: TEvent): void {
    const eventConstructor = getConstructorOf<TEvent>(event);
    const eventHandler = this.getEventHandlerFor<TEvent>(eventConstructor);
    eventHandler.handle(event);
  }

  private getEventHandlerFor<TEvent>(
    eventConstructor: ClassConstructor<TEvent>
  ): EventHandler<TEvent> {
    const eventHandlers = this.services.getAll<EventHandler<TEvent>>(EventHandlerToken);

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
