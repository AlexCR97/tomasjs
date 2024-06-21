import { Command } from "commander";
import { CommandFactory } from "./CommandFactory";
import { join } from "path";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import { exec } from "child_process";
import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";

export class BuildCommand implements CommandFactory {
  createCommand(): Command {
    return new Command()
      .name("build")
      .description("Builds a TomasJS project")
      .action(async () => {
        const currentDir = process.cwd();

        if (!existsSync(join(currentDir, "tomasjs.json"))) {
          return console.log("Could not find project in current directory");
        }

        console.log("Building project...");

        const distDir = join(currentDir, "dist");
        await rm(distDir, { force: true, recursive: true });

        const tscResult = await this.exec("npx tsc -b ./tsconfig.build.json");
        if (tscResult.error) {
          return console.error(tscResult.error);
        }

        const tscAliasResult = await this.exec("npx tsc-alias");
        if (tscAliasResult.error) {
          return console.error(tscAliasResult.error);
        }

        const packageResult = await this.exec("node ./dist/package.js");
        if (packageResult.error) {
          return console.error(packageResult.error);
        }

        console.log("Project built!");
        console.log("To run the project: pnpm start");
      });
  }

  private async exec(
    command: string
  ): Promise<ResultFailure<Error> | ResultSuccess<number | null>> {
    return new Promise((resolve) => {
      const child = exec(command);

      child.stdout?.on("data", (data) => {
        console.log(data);
      });

      child.stderr?.on("data", (data) => {
        console.error(data);
      });

      child.on("close", (code) => {
        return resolve(Result.success(code));
      });

      child.on("error", (err) => {
        return resolve(Result.failure(err));
      });
    });
  }
}
