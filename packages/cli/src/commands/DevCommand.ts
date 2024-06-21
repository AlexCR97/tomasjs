import { Command } from "commander";
import { CommandFactory } from "./CommandFactory";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { Executable } from "@/process";

export class DevCommand implements CommandFactory {
  createCommand(): Command {
    return new Command()
      .name("dev")
      .description("run a project and watch changes")
      .action(async () => {
        const currentDir = process.cwd();

        if (!existsSync(join(currentDir, "tomasjs.json"))) {
          return console.log("Could not find project in current directory");
        }

        const result = await Executable.run("npx nodemon -r tsconfig-paths/register ./src/app.ts");

        if (result.error) {
          return console.error(result.error);
        }

        if (result.data !== null) {
          return console.log(`Exit code: ${result.data}`);
        }
      });
  }
}
