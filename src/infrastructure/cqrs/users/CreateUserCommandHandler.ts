import { CommandHandler } from "@/core/cqrs/core/commands";
import { CreateUserCommand } from "@/core/cqrs/users/CreateUserCommand";
import { injectable } from "tsyringe";

@injectable()
export class CreateUserCommandHandler extends CommandHandler<CreateUserCommand> {
  handle(command: CreateUserCommand): void {
    console.log("CreateUserCommandHandler", command);
  }
}
