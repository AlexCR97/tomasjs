import { Command } from "commander";
import { CommandFactory } from "./CommandFactory";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { Executable } from "@/process";
import { APP_LOGGER } from "@/logger";
import { inject } from "@tomasjs/core/dependency-injection";
import { ILogger } from "@tomasjs/core/logging";

export class StartCommand implements CommandFactory {
  constructor(
    @inject(APP_LOGGER)
    private readonly appLogger: ILogger
  ) {}

  createCommand(): Command {
    return new Command()
      .name("start")
      .description("run the build of a project")
      .action(async () => {
        try {
          const currentDir = process.cwd();

          if (!existsSync(join(currentDir, "tomasjs.json"))) {
            throw new Error("Could not find project in current directory");
          }

          // TODO Preserve output color
          const result = await Executable.run("node ./dist/app.js");

          if (result.error) {
            throw result.error;
          }

          if (result.data !== null) {
            console.log(`Exit code: ${result.data}`);
          }
        } catch (err) {
          if (err instanceof Error) {
            this.appLogger.error(err.message);
          } else {
            this.appLogger.error(`An unexpected error occurred: ${err}`);
          }
        }
      });
  }
}
