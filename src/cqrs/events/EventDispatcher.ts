import { ClassConstructor, internalContainer, singleton } from "@/container";
import { TomasError } from "@/core/errors";
import { getConstructorOf } from "@/core/internal";
import { EventHandler } from "./EventHandler";
import { EventHandlerMetadata, EventHandlerToken } from "./metadata";

@singleton()
export class EventDispatcher {
  emit<TEvent>(event: TEvent): void {
    const eventConstructor = getConstructorOf<TEvent>(event);
    const eventHandler = this.getEventHandlerFor<TEvent>(eventConstructor);
    eventHandler.handle(event);
  }

  private getEventHandlerFor<TEvent>(
    eventConstructor: ClassConstructor<TEvent>
  ): EventHandler<TEvent> {
    const eventHandlers = internalContainer.getAll<EventHandler<TEvent>>(EventHandlerToken);

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
