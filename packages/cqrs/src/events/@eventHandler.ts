import { ClassConstructor, injectable } from "@tomasjs/core";
import { EventHandlerMetadata } from "./metadata";

export function eventHandler<TEvent>(eventConstructor: ClassConstructor<TEvent>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    const metadata = new EventHandlerMetadata(constructor);
    metadata.eventConstructor = eventConstructor;
    return constructor;
  };
}
