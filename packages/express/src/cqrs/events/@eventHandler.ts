import { ClassConstructor, globalContainer, injectable } from "@tomasjs/core";
import { EventHandlerMetadata, EventHandlerToken } from "./metadata";

export function eventHandler<TEvent>(eventConstructor: ClassConstructor<TEvent>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    globalContainer.addClass(constructor, { token: EventHandlerToken });
    const metadata = new EventHandlerMetadata(constructor);
    metadata.eventConstructor = eventConstructor;
    return constructor;
  };
}
