import { internalContainer, singleton } from "@/container";
import { TomasError } from "@/core/errors";
import { ClassConstructor } from "class-transformer";
import { CommandHandler } from "./CommandHandler";
import { CommandHandlerMetadata } from "./metadata/CommandHandlerMetadata";
import { CommandHandlerToken } from "./metadata/CommandHandlerToken";

@singleton()
export class CommandDispatcher {
  async execute<TResult = void, TCommand = any>(command: TCommand): Promise<TResult> {
    const commandConstructor = this.getConstructorOf<TCommand>(command);
    const commandHandler = this.getCommandHandlerFor<TCommand, TResult>(commandConstructor);
    return await commandHandler.execute(command);
  }

  private getConstructorOf<T>(source: any): ClassConstructor<T> {
    const sourcePrototype = Object.getPrototypeOf(source);

    const sourceConstructor: ClassConstructor<T> = sourcePrototype?.constructor;

    if (!sourceConstructor) {
      throw new TomasError("The provided source does not have a constructor.", {
        data: { source },
      });
    }

    return sourceConstructor;
  }

  private getCommandHandlerFor<TCommand, TResult>(
    commandConstructor: ClassConstructor<TCommand>
  ): CommandHandler<TCommand, TResult> {
    const commandHandlers =
      internalContainer.getAll<CommandHandler<TCommand, TResult>>(CommandHandlerToken);

    const matchingCommandHandler = commandHandlers.find((ch) => {
      const metadata = new CommandHandlerMetadata(ch);
      return metadata.commandConstructor === commandConstructor;
    });

    if (!matchingCommandHandler) {
      throw new TomasError("Could not find a CommandHandler for the dispatched command.", {
        data: { commandConstructor },
      });
    }

    return matchingCommandHandler;
  }
}
