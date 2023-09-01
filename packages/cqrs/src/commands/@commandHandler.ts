import { ClassConstructor, injectable } from "@tomasjs/core";
import { CommandHandlerMetadata } from "./CommandHandlerMetadata";

export function commandHandler<TCommand>(commandConstructor: ClassConstructor<TCommand>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    const metadata = new CommandHandlerMetadata(constructor);
    metadata.commandConstructor = commandConstructor;
    return constructor;
  };
}
