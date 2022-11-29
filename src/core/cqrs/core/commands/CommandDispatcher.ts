import { container, injectable } from "tsyringe";
import { Command } from "./Command";
import { CommandHandler } from "./CommandHandler";

@injectable()
export class CommandDispatcher {
  dispatch<TCommand extends Command>(command: TCommand) {
    const commandHandlerClassName = `${command.constructor.name}Handler`;
    const commandHandler = container.resolve(commandHandlerClassName) as CommandHandler<TCommand>;
    commandHandler.handle(command);
  }
}
