import {
  ClassConstructor,
  ServiceProvider,
  TomasError,
  getConstructorOf,
  inject,
  injectable,
  serviceProviderToken,
} from "@tomasjs/core";
import { CommandHandler } from "./CommandHandler";
import { commandHandlerToken } from "./commandHandlerToken";
import { CommandHandlerMetadata } from "./CommandHandlerMetadata";

@injectable()
export class CommandDispatcher {
  constructor(@inject(serviceProviderToken) private readonly services: ServiceProvider) {}

  async execute<TResult = void, TCommand = any>(command: TCommand): Promise<TResult> {
    const commandConstructor = getConstructorOf<TCommand>(command);
    const commandHandler = this.getHandlerFor<TCommand, TResult>(commandConstructor);
    return await commandHandler.execute(command);
  }

  private getHandlerFor<TCommand, TResult>(
    commandConstructor: ClassConstructor<TCommand>
  ): CommandHandler<TCommand, TResult> {
    const commandHandlers =
      this.services.getAll<CommandHandler<TCommand, TResult>>(commandHandlerToken);

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
