import { ClassConstructor } from "@/container";
import { CommandHandler } from "../CommandHandler";
import { CommandHandlerMetadataKeys } from "./CommandHandlerMetadataKeys";

export class CommandHandlerMetadata<TCommand, TResult> {
  private readonly commandConstructorKey = CommandHandlerMetadataKeys.commandConstructor;

  constructor(
    private readonly commandHandler:
      | CommandHandler<TCommand, TResult>
      | ClassConstructor<CommandHandler<TCommand, TResult>>
  ) {}

  get commandConstructor(): ClassConstructor<any> {
    return Reflect.getMetadata(this.commandConstructorKey, this.commandHandlerPrototype);
  }
  set commandConstructor(value: ClassConstructor<any>) {
    Reflect.defineMetadata(this.commandConstructorKey, value, this.commandHandlerPrototype);
  }

  private get commandHandlerPrototype() {
    return this.isCommandHandler(this.commandHandler)
      ? Object.getPrototypeOf(this.commandHandler)
      : this.commandHandler.prototype;
  }

  private isCommandHandler(obj: any): obj is CommandHandler<TCommand, TResult> {
    if (obj === undefined || obj === null) {
      return false;
    }

    const func = obj.execute as Function;

    if (typeof func !== "function") {
      return false;
    }

    // Considering that the "execute" property must be a named function...
    return (
      func.name.trim() === "execute" && // The name must be "execute"
      func.length === 1 // It must receive 1 argument
    );
  }
}
