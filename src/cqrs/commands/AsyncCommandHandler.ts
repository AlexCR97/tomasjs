import { Command } from "./Command";

export abstract class AsyncCommandHandler<TCommand extends Command> {
  abstract handleAsync(command: TCommand): Promise<void>;
}
