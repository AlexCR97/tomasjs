import { serviceProviderToken } from "@/serviceProviderToken";
import { CommandHandler } from "./CommandHandler";
import { CommandHandlerMetadata, CommandHandlerToken } from "./metadata";
import {
  ClassConstructor,
  ServiceProvider,
  TomasError,
  getConstructorOf,
  inject,
  injectable,
} from "@tomasjs/core";

@injectable()
export class CommandDispatcher {
  constructor(@inject(serviceProviderToken) private readonly services: ServiceProvider) {}

  async execute<TResult = void, TCommand = any>(command: TCommand): Promise<TResult> {
    const commandConstructor = getConstructorOf<TCommand>(command);
    const commandHandler = this.getCommandHandlerFor<TCommand, TResult>(commandConstructor);
    return await commandHandler.execute(command);
  }

  private getCommandHandlerFor<TCommand, TResult>(
    commandConstructor: ClassConstructor<TCommand>
  ): CommandHandler<TCommand, TResult> {
    const commandHandlers =
      this.services.getAll<CommandHandler<TCommand, TResult>>(CommandHandlerToken);

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
