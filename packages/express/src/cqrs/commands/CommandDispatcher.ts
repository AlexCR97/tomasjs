import { CommandHandler } from "./CommandHandler";
import { CommandHandlerMetadata, CommandHandlerToken } from "./metadata";
import {
  ClassConstructor,
  TomasError,
  getConstructorOf,
  globalContainer,
  singleton,
} from "@tomasjs/core";

@singleton()
export class CommandDispatcher {
  async execute<TResult = void, TCommand = any>(command: TCommand): Promise<TResult> {
    const commandConstructor = getConstructorOf<TCommand>(command);
    const commandHandler = this.getCommandHandlerFor<TCommand, TResult>(commandConstructor);
    return await commandHandler.execute(command);
  }

  private getCommandHandlerFor<TCommand, TResult>(
    commandConstructor: ClassConstructor<TCommand>
  ): CommandHandler<TCommand, TResult> {
    const commandHandlers =
      globalContainer.getAll<CommandHandler<TCommand, TResult>>(CommandHandlerToken);

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
