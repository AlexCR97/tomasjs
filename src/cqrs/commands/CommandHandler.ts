import { Command } from "./Command";

export abstract class CommandHandler<TCommand extends Command> {
  abstract handle(command: TCommand): void;
}
