import { Constructor } from "@/system";
import { EVENT_HANDLERS, EventHandler, isEventHandler } from "./EventHandler";

export function eventHandler<TEvent>(eventConstructor: Constructor<TEvent>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    new EventHandlerMetadata(constructor).eventConstructor = eventConstructor;
    return constructor;
  };
}

export class EventHandlerMetadata<TEvent> {
  private readonly EVENT_CONSTRUCTOR = `${EVENT_HANDLERS}/Constructor`;

  constructor(
    private readonly eventHandler: EventHandler<TEvent> | Constructor<EventHandler<TEvent>>
  ) {}

  get eventConstructor(): Constructor<any> {
    return Reflect.getMetadata(this.EVENT_CONSTRUCTOR, this.eventHandlerPrototype);
  }
  set eventConstructor(value: Constructor<any>) {
    Reflect.defineMetadata(this.EVENT_CONSTRUCTOR, value, this.eventHandlerPrototype);
  }

  private get eventHandlerPrototype() {
    return isEventHandler(this.eventHandler)
      ? Object.getPrototypeOf(this.eventHandler)
      : this.eventHandler.prototype;
  }
}
