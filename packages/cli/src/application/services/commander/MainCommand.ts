import { inject, injectable } from "@tomasjs/core";
import { Command } from "commander";
import { InitCommand } from "./InitCommand";

@injectable()
export class MainCommand {
  constructor(@inject(InitCommand) private readonly initCommand: InitCommand) {}

  create(): Command {
    const main = new Command()
      .name("tomasjs")
      .description("The official CLI for TomasJS")
      .version("1.0.0");

    main.addCommand(this.initCommand.create());

    return main;
  }
}
