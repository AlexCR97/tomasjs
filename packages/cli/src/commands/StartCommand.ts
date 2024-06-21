import { Command } from "commander";
import { CommandFactory } from "./CommandFactory";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { Executable } from "@/process";

export class StartCommand implements CommandFactory {
  createCommand(): Command {
    return new Command()
      .name("start")
      .description("run the build of a project")
      .action(async () => {
        const currentDir = process.cwd();

        if (!existsSync(join(currentDir, "tomasjs.json"))) {
          return console.log("Could not find project in current directory");
        }

        await Executable.run("node ./dist/app.js");
      });
  }
}
