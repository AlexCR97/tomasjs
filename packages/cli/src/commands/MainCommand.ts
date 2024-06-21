import { Command } from "commander";
import { CommandFactory } from "./CommandFactory";
import { inject } from "@tomasjs/core/dependency-injection";
import { InitCommand } from "./InitCommand";
import { BuildCommand } from "./BuildCommand";
import { DevCommand } from "./DevCommand";
import { StartCommand } from "./StartCommand";

export class MainCommand implements CommandFactory {
  constructor(
    @inject(InitCommand) private readonly init: InitCommand,
    @inject(BuildCommand) private readonly build: BuildCommand,
    @inject(DevCommand) private readonly dev: DevCommand,
    @inject(StartCommand) private readonly start: StartCommand
  ) {}

  createCommand(): Command {
    return new Command()
      .name("tomasjs")
      .description("The official CLI for TomasJS")
      .version("1.0.0")
      .addCommand(this.init.createCommand())
      .addCommand(this.build.createCommand())
      .addCommand(this.dev.createCommand())
      .addCommand(this.start.createCommand());
  }
}
