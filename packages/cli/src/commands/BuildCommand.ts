import { Command } from "commander";
import { CommandFactory } from "./CommandFactory";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Executable } from "@/process";
import { APP_LOGGER } from "@/logger";
import { inject } from "@tomasjs/core/dependency-injection";
import { ILogger } from "@tomasjs/core/logging";

export class BuildCommand implements CommandFactory {
  constructor(
    @inject(APP_LOGGER)
    private readonly appLogger: ILogger
  ) {}

  createCommand(): Command {
    return new Command()
      .name("build")
      .description("build a project")
      .action(async () => {
        try {
          const currentDir = process.cwd();

          if (!existsSync(join(currentDir, "tomasjs.json"))) {
            throw new Error("Could not find project in current directory");
          }

          console.log("🔨 Building project...");

          const distDir = join(currentDir, "dist");
          await rm(distDir, { force: true, recursive: true });

          const tscResult = await Executable.run("npx tsc -b ./tsconfig.build.json");
          if (tscResult.error) {
            throw tscResult.error;
          }

          const tscAliasResult = await Executable.run("npx tsc-alias");
          if (tscAliasResult.error) {
            throw tscAliasResult.error;
          }

          console.log();

          console.log("✅ Project built \n");

          console.log("🚀 To run the project:");
          console.log("> tomasjs start");
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
