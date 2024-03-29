import { ClassConstructor } from "@tomasjs/core";
import { EventHandler } from "./EventHandler";
import { TokenBuilder } from "@tomasjs/core/tokens";
import { eventHandlerToken } from "./eventHandlerToken";

export class EventHandlerMetadata<TEvent> {
  private readonly eventConstructorKey = new TokenBuilder()
    .with(eventHandlerToken)
    .with("constructor")
    .build();

  constructor(
    private readonly eventHandler: EventHandler<TEvent> | ClassConstructor<EventHandler<TEvent>>
  ) {}

  get eventConstructor(): ClassConstructor<any> {
    return Reflect.getMetadata(this.eventConstructorKey, this.eventHandlerPrototype);
  }
  set eventConstructor(value: ClassConstructor<any>) {
    Reflect.defineMetadata(this.eventConstructorKey, value, this.eventHandlerPrototype);
  }

  private get eventHandlerPrototype() {
    return this.isEventHandler(this.eventHandler)
      ? Object.getPrototypeOf(this.eventHandler)
      : this.eventHandler.prototype;
  }

  private isEventHandler(obj: any): obj is EventHandler<TEvent> {
    if (obj === undefined || obj === null) {
      return false;
    }

    const func = obj.handle as Function;

    if (typeof func !== "function") {
      return false;
    }

    // Considering that the "handle" property must be a named function...
    return (
      func.name.trim() === "handle" && // The name must be "handle"
      func.length === 1 // It must receive 1 argument
    );
  }
}
