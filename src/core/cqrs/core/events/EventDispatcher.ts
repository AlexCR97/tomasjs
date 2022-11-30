import { container, injectable } from "tsyringe";
import { Event } from "./Event";
import { EventHandler } from "./EventHandler";

@injectable()
export class EventDispatcher {
  dispatch<TEvent extends Event>(event: TEvent) {
    const eventHandlerClassName = `${event.constructor.name}Handler`;
    const eventHandler = container.resolve(eventHandlerClassName) as EventHandler<TEvent>;
    eventHandler.handle(event);
  }
}
