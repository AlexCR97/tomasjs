import { ClassConstructor } from "@tomasjs/core";
import { CommandHandler } from "./CommandHandler";
import { TokenBuilder } from "@tomasjs/core/tokens";
import { commandHandlerToken } from "./commandHandlerToken";
import { isCommandHandler } from "./isCommandHandler";

export class CommandHandlerMetadata<TCommand, TResult> {
  private readonly commandConstructorKey = new TokenBuilder()
    .with(commandHandlerToken)
    .with("constructor")
    .build();

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
    return isCommandHandler(this.commandHandler)
      ? Object.getPrototypeOf(this.commandHandler)
      : this.commandHandler.prototype;
  }
}
