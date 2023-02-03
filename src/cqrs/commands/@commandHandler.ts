import { ClassConstructor, injectable, internalContainer } from "@/container";
import { CommandHandlerMetadata, CommandHandlerToken } from "./metadata";

export function commandHandler<TCommand>(commandConstructor: ClassConstructor<TCommand>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    internalContainer.addClass(constructor, { token: CommandHandlerToken });
    const metadata = new CommandHandlerMetadata(constructor);
    metadata.commandConstructor = commandConstructor;
    return constructor;
  };
}
