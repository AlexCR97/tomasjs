import { container, injectable } from "tsyringe";
import { AsyncCommandHandler } from "./AsyncCommandHandler";
import { Command } from "./Command";
import { CommandHandler } from "./CommandHandler";

@injectable()
export class CommandDispatcher {
  dispatch<TCommand extends Command>(command: TCommand) {
    const commandHandlerClassName = `${command.constructor.name}Handler`;
    const commandHandler = container.resolve(commandHandlerClassName) as CommandHandler<TCommand>;
    commandHandler.handle(command);
  }

  async dispatchAsync<TCommand extends Command>(command: TCommand): Promise<void> {
    const commandHandlerClassName = `${command.constructor.name}Handler`;
    const commandHandler = container.resolve(
      commandHandlerClassName
    ) as AsyncCommandHandler<TCommand>;
    await commandHandler.handleAsync(command);
  }
}
