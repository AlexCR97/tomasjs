import childProcess from "child_process";
import { Command } from "commander";
import { input, select } from "@inquirer/prompts";
import { inject, injectable } from "@tomasjs/core";
import {
  IProjectTemplateDownloader,
  ProjectTemplate,
  projectTemplateDownloaderToken,
} from "../IProjectTemplateDownloader";
import { ZipService } from "../ZipService";
import { TomasLogger } from "@tomasjs/logging";
import path from "path";
import fs from "fs";
import { Result, ResultFailure, ResultSuccess } from "@/common";

@injectable()
export class InitCommand {
  private readonly logger = new TomasLogger(InitCommand.name, "error");

  constructor(
    @inject(projectTemplateDownloaderToken)
    private readonly projectTemplateDownloader: IProjectTemplateDownloader,

    @inject(ZipService)
    private readonly zip: ZipService
  ) {}

  create(): Command {
    return new Command()
      .name("new")
      .description("Creates a new TomasJS project")
      .action(async () => {
        const projectName = await this.askProjectName();
        const projectTemplate = await this.askProjectTemplateType();

        console.log("Creating project directory...");

        const { data: projectDirectory, error: projectDirectoryErr } =
          this.createProjectDirectory(projectName);

        if (projectDirectoryErr) {
          console.log(projectDirectoryErr.message);
          return;
        }

        console.log("Downloading project template...");

        const { data: downloadedZipPath, error: downloadError } =
          await this.projectTemplateDownloader.download(projectTemplate, projectDirectory);

        if (downloadError) {
          console.log(downloadError.message);
          return;
        }

        const { error: unzipError } = await this.zip.unzip(downloadedZipPath, projectDirectory);

        fs.unlinkSync(downloadedZipPath);

        if (unzipError) {
          console.log(unzipError.message);
          return;
        }

        this.installProjectDependencies(projectName, projectDirectory);
      });
  }

  private async askProjectName(): Promise<string> {
    console.log(
      "A valid project name must contain only letters (a-z A-Z), numbers (0-9), hyphens (-), underscores (_) and must not start with a number."
    );

    return await input({
      message: "Project name:",
      validate(value) {
        // Criteria for a valid name:
        // 1. Should contain only letters, numbers, hyphens, and underscores
        // 2. Must not start with a number
        const containsOnlyValidChars = /^[a-zA-Z0-9_-]+$/.test(value);
        const doesNotStartWithNumber = /^[^0-9]/.test(value);
        return containsOnlyValidChars && doesNotStartWithNumber;
      },
    });
  }

  private createProjectDirectory(
    projectName: string
  ): ResultSuccess<string> | ResultFailure<Error> {
    try {
      const currentWorkingDirectory = process.cwd();
      this.logger.debug(`currentWorkingDirectory: ${currentWorkingDirectory}`);

      const newProjectDirectory = path.join(currentWorkingDirectory, projectName);
      this.logger.debug(`newProjectDirectory: ${newProjectDirectory}`);

      if (fs.existsSync(newProjectDirectory)) {
        return Result.failure(
          new Error(
            `A project named "${projectName}" already exists in the current directory. Please use another name.`
          )
        );
      }

      fs.mkdirSync(newProjectDirectory);

      return Result.success(newProjectDirectory);
    } catch (err) {
      if (err instanceof Error) {
        return Result.failure(err);
      }

      return Result.failure(new Error(`An unexpected error occurred: ${err}`));
    }
  }

  private async askProjectTemplateType(): Promise<ProjectTemplate> {
    return await select<ProjectTemplate>({
      message: "What type of project do you want to create?",
      choices: [
        {
          name: "Console",
          value: "console",
        },
        {
          name: "Express",
          value: "express",
        },
      ],
    });
  }

  private installProjectDependencies(projectName: string, projectDirectory: string) {
    console.log("Installing project dependencies...");

    process.chdir(projectDirectory); // equivalent to "cd /some/path"
    childProcess.execSync("npm install");

    console.log("Your TomasJS project has been created!");
    console.log("Next steps:");
    console.log(`- cd ./${projectName}`);
    console.log("- npm run dev");
  }
}
