import { ClassConstructor, injectable } from "@tomasjs/core";
import { CommandHandlerMetadata } from "./metadata";

export function commandHandler<TCommand>(commandConstructor: ClassConstructor<TCommand>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    const metadata = new CommandHandlerMetadata(constructor);
    metadata.commandConstructor = commandConstructor;
    return constructor;
  };
}
