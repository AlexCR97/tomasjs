import { Command } from "commander";
import { CommandFactory } from "./CommandFactory";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Executable } from "@/process";

export class BuildCommand implements CommandFactory {
  createCommand(): Command {
    return new Command()
      .name("build")
      .description("build a project")
      .action(async () => {
        const currentDir = process.cwd();

        if (!existsSync(join(currentDir, "tomasjs.json"))) {
          return console.log("Could not find project in current directory");
        }

        console.log("Building project...");

        const distDir = join(currentDir, "dist");
        await rm(distDir, { force: true, recursive: true });

        const tscResult = await Executable.run("npx tsc -b ./tsconfig.build.json");
        if (tscResult.error) {
          return console.error(tscResult.error);
        }

        const tscAliasResult = await Executable.run("npx tsc-alias");
        if (tscAliasResult.error) {
          return console.error(tscAliasResult.error);
        }

        const packageResult = await Executable.run("node ./dist/package.js");
        if (packageResult.error) {
          return console.error(packageResult.error);
        }

        console.log("Project built!");
        console.log("To run the project: pnpm start");
      });
  }
}
