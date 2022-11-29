import { AutoMap } from "@automapper/classes";
import { Command } from "../core/commands";

export class SignUpUserCommand extends Command {
  @AutoMap()
  id: string;

  @AutoMap()
  email: string;

  @AutoMap()
  password: string;

  constructor(options: { id: string; email: string; password: string }) {
    super();
    this.id = options.id;
    this.email = options.email;
    this.password = options.password;
  }
}
