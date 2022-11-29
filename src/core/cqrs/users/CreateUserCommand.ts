import { Command } from "../core/commands";

export class CreateUserCommand extends Command {
  readonly email: string;
  constructor(options: { email: string }) {
    console.log("CreateUserCommand", options);
    super();
    this.email = options.email;
  }
}
