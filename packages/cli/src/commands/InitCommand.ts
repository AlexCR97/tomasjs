import { Command } from "commander";
import { input, select } from "@inquirer/prompts";
import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";
import { ILogger, LoggerFactory } from "@tomasjs/core/logging";
import path from "node:path";
import fs from "node:fs";
import { rm } from "node:fs/promises";
import yauzl, { Entry, ZipFile } from "yauzl";
import { execSync } from "node:child_process";
import {
  IProjectTemplateDownloaderFactory,
  PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN,
  TemplateType,
} from "@/templates";
import { CommandFactory } from "./CommandFactory";
import { inject } from "@tomasjs/core/dependency-injection";

export class InitCommand implements CommandFactory {
  private readonly logger: ILogger;

  constructor(
    @inject(LoggerFactory)
    loggerFactory: LoggerFactory,

    @inject(PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN)
    private readonly projectTemplateDownloaderFactory: IProjectTemplateDownloaderFactory
  ) {
    this.logger = loggerFactory.createLogger(InitCommand.name, "debug");
  }

  createCommand(): Command {
    return new Command()
      .name("init")
      .description("Creates a new TomasJS project")
      .action(async () => {
        const projectName = await this.inputProjectName();

        const projectTemplate = await this.selectProjectTemplateType();

        console.log("Creating project directory...");
        const projectDirectoryResult = this.createProjectDirectory(projectName);

        if (projectDirectoryResult.error) {
          console.error(projectDirectoryResult.error);
          return;
        }

        console.log("Downloading project template...");
        const templateDownloadResult = await this.projectTemplateDownloaderFactory
          .createProjectTemplateDownloader()
          .download(projectTemplate);

        if (templateDownloadResult.error) {
          console.error(templateDownloadResult.error.message);
          return;
        }

        console.log("Unzipping project template...");
        const unzipResult = await this.unzip(
          templateDownloadResult.data!.downloadedFileName,
          projectDirectoryResult.data!.projectDirectory
        );

        if (unzipResult.error) {
          console.error(unzipResult.error.message);
          return;
        }

        await rm(templateDownloadResult.data!.downloadedPath, { recursive: true, force: true });

        // TODO Replace values in package.json
        // TODO Replace values in tomasjs.json

        this.installDependencies(projectDirectoryResult.data!.projectDirectory);

        console.log("Your TomasJS project has been created!");
        console.log("Next steps:");
        console.log(`$ cd ./${projectName}`);
        console.log("$ pnpm dev");
      });
  }

  private inputProjectName(): Promise<string> {
    console.log(
      "A valid project name must contain only letters (a-z A-Z), numbers (0-9), hyphens (-), underscores (_) and must not start with a number."
    );

    return input({
      message: "Project name:",
      validate(value) {
        const containsOnlyValidChars = /^[a-zA-Z0-9_-]+$/.test(value);
        const doesNotStartWithNumber = /^[^0-9]/.test(value);
        return containsOnlyValidChars && doesNotStartWithNumber;
      },
    });
  }

  private selectProjectTemplateType(): Promise<TemplateType> {
    return select({
      message: "What type of project do you want to create?",
      choices: [
        {
          value: "empty",
          name: "Empty",
        },
        {
          value: "console",
          name: "Console App",
        },
      ],
    });
  }

  private createProjectDirectory(
    projectName: string
  ): ResultSuccess<{ projectDirectory: string }> | ResultFailure<string> {
    try {
      const currentWorkingDirectory = process.cwd();

      this.logger.debug(`currentWorkingDirectory: ${currentWorkingDirectory}`);

      const projectDirectory = path.join(currentWorkingDirectory, projectName);
      this.logger.debug(`projectDirectory: ${projectDirectory}`);

      if (fs.existsSync(projectDirectory)) {
        return Result.failure(
          `A project named "${projectName}" already exists in the current directory. Please use another name.`
        );
      }

      fs.mkdirSync(projectDirectory);

      return Result.success({ projectDirectory });
    } catch (err) {
      if (err instanceof Error) {
        return Result.failure(err.message);
      }

      return Result.failure(`An unexpected error occurred: ${err}`);
    }
  }

  private async unzip(
    zipFilePath: string,
    toPath: string
  ): Promise<ResultSuccess | ResultFailure<Error>> {
    this.logger.debug(`Opening zip ${zipFilePath} ...`);

    return new Promise((resolve) => {
      yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipFile: ZipFile) => {
        if (err) {
          this.logger.debug(`Could not open zip ${zipFilePath}. Reason: ${err.message}`);
          return resolve(Result.failure(err));
        }

        this.logger.debug("Reading entries ...");

        zipFile.readEntry();

        zipFile.on("entry", (entry: Entry) => {
          this.logger.debug(`entry: ${entry.fileName}`);

          if (/\/$/.test(entry.fileName)) {
            // directory entry
            this.logger.debug("entry is a directory!");

            // Directory file names end with '/'.
            // Note that entries for directories themselves are optional.
            // An entry's fileName implicitly requires its parent directories to exist.
            zipFile.readEntry();
          } else {
            // file entry
            this.logger.debug("entry is a file!");

            this.logger.debug(`Opening read stream for ${entry.fileName} ...`);

            zipFile.openReadStream(entry, (err, readStream) => {
              if (err) {
                this.logger.debug(
                  `Could not open read stream for ${entry.fileName}. Reason: ${err.message}`
                );
                return resolve(Result.failure(err));
              }

              readStream.on("end", () => {
                this.logger.debug(`Read stream for ${entry.fileName} ended`);
                zipFile.readEntry();
              });

              const entryFileNameParts = entry.fileName.split("/");
              this.logger.debug("entryFileNameParts", entryFileNameParts);

              if (entryFileNameParts.length > 1) {
                const entryFileNamePartsWithoutFileName = entryFileNameParts.slice(
                  0,
                  entryFileNameParts.length - 1
                );
                this.logger.debug(
                  "entryFileNamePartsWithoutFileName",
                  entryFileNamePartsWithoutFileName
                );

                const downloadPathParts = [toPath, ...entryFileNamePartsWithoutFileName];
                this.logger.debug("downloadPathParts", downloadPathParts);

                fs.mkdirSync(path.join(...downloadPathParts), { recursive: true });
              }

              const writePath = path.join(toPath, entry.fileName);
              this.logger.debug(`Writing stream to ${writePath} ...`);
              fs.writeFileSync(writePath, "");
              const writeStream = fs.createWriteStream(writePath);
              readStream.pipe(writeStream);
            });
          }
        });

        zipFile.once("end", () => {
          this.logger.info("zip file reading ended.");
          resolve(Result.success(null));
        });
      });
    });
  }

  private installDependencies(projectDirectory: string) {
    console.log("Installing project dependencies...");

    process.chdir(projectDirectory); // equivalent to "cd /some/path"
    execSync("pnpm i");
  }
}
