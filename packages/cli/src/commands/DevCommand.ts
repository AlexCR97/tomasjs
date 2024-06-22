import { Command } from "commander";
import { CommandFactory } from "./CommandFactory";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { Executable } from "@/process";
import { APP_LOGGER } from "@/logger";
import { inject } from "@tomasjs/core/dependency-injection";
import { ILogger } from "@tomasjs/core/logging";

export class DevCommand implements CommandFactory {
  constructor(
    @inject(APP_LOGGER)
    private readonly appLogger: ILogger
  ) {}

  createCommand(): Command {
    return new Command()
      .name("dev")
      .description("run a project and watch changes")
      .action(async () => {
        try {
          const currentDir = process.cwd();

          if (!existsSync(join(currentDir, "tomasjs.json"))) {
            throw new Error("Could not find project in current directory");
          }

          // TODO Preserve output color
          const result = await Executable.run(
            "npx nodemon -r tsconfig-paths/register ./src/app.ts"
          );

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
