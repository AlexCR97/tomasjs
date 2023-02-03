import { internalContainer, singleton } from "@/container";
import { TomasError } from "@/core/errors";
import { EventHandler } from "./EventHandler";

@singleton()
export class EventDispatcher {
  emit<TEvent>(event: TEvent): void {
    const eventConstructorName = (event as any)?.constructor?.name;

    if (!eventConstructorName)
      throw new TomasError("The emitted event is not a class instance", { data: { event } });

    const eventHandlerToken = `${eventConstructorName}Handler`;

    const eventHandler = internalContainer.get<EventHandler<TEvent>>(eventHandlerToken);

    eventHandler.handle(event); // Event handlers should not be awaited
  }
}
