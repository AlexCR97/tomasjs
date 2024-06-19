import { Command } from "commander";
import { CommandFactory } from "./CommandFactory";
import { inject } from "@tomasjs/core/dependency-injection";
import { InitCommand } from "./InitCommand";

export class MainCommand implements CommandFactory {
  constructor(@inject(InitCommand) private readonly init: InitCommand) {}

  createCommand(): Command {
    return new Command()
      .name("tomasjs")
      .description("The official CLI for TomasJS")
      .version("1.0.0")
      .addCommand(this.init.createCommand());
  }
}
