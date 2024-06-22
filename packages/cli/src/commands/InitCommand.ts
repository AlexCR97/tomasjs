import { Command } from "commander";
import { input, select } from "@inquirer/prompts";
import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";
import { ILogger, LoggerFactory } from "@tomasjs/core/logging";
import path, { join } from "node:path";
import fs from "node:fs";
import { rm, writeFile } from "node:fs/promises";
import yauzl, { Entry, ZipFile } from "yauzl";
import {
  IProjectTemplateDownloaderFactory,
  PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN,
  TemplateType,
} from "@/templates";
import { CommandFactory } from "./CommandFactory";
import { inject } from "@tomasjs/core/dependency-injection";
import { readJsonFile } from "@tomasjs/core/files";
import { Executable } from "@/process";

export class InitCommand implements CommandFactory {
  private readonly debugLogger: ILogger;
  private readonly infoLogger: ILogger;

  constructor(
    @inject(LoggerFactory)
    loggerFactory: LoggerFactory,

    @inject(PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN)
    private readonly projectTemplateDownloaderFactory: IProjectTemplateDownloaderFactory
  ) {
    this.debugLogger = loggerFactory.createLogger(InitCommand.name, "debug");
    this.infoLogger = loggerFactory.createLogger("@tomasjs/cli", "info");
  }

  createCommand(): Command {
    return new Command()
      .name("init")
      .description("create a new project")
      .action(async () => {
        const projectName = await this.inputProjectName();

        const projectTemplate = await this.selectProjectTemplateType();

        this.infoLogger.info("Creating project directory...");

        const projectDirectoryResult = this.createProjectDirectory(projectName);

        if (projectDirectoryResult.error) {
          console.error(projectDirectoryResult.error);
          return;
        }

        this.infoLogger.info("Installing project template...");

        const templateDownloadResult = await this.projectTemplateDownloaderFactory
          .createProjectTemplateDownloader()
          .download(projectTemplate);

        if (templateDownloadResult.error) {
          console.error(templateDownloadResult.error.message);
          return;
        }

        this.debugLogger.debug("Unzipping project template...");

        const unzipResult = await this.unzip(
          templateDownloadResult.data!.downloadedFileName,
          projectDirectoryResult.data!.projectDirectory
        );

        if (unzipResult.error) {
          console.error(unzipResult.error.message);
          return;
        }

        await rm(templateDownloadResult.data!.downloadedPath, { recursive: true, force: true });

        await this.injectValuesInJsonFile(
          join(projectDirectoryResult.data!.projectDirectory, "package.json"),
          {
            name: projectName,
          }
        );

        await this.injectValuesInJsonFile(
          join(projectDirectoryResult.data!.projectDirectory, "tomasjs.json"),
          {
            "project.name": projectName,
            "project.template": projectTemplate,
          }
        );

        await this.installDependencies(projectDirectoryResult.data!.projectDirectory);

        console.log("✅ Project created\n");

        console.log("🚀 Next steps:");
        console.log(`> cd ./${projectName}`);
        console.log("> tomasjs dev");
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

      this.debugLogger.debug(`currentWorkingDirectory: ${currentWorkingDirectory}`);

      const projectDirectory = path.join(currentWorkingDirectory, projectName);
      this.debugLogger.debug(`projectDirectory: ${projectDirectory}`);

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
    this.debugLogger.debug(`Opening zip ${zipFilePath} ...`);

    return new Promise((resolve) => {
      yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipFile: ZipFile) => {
        if (err) {
          this.debugLogger.debug(`Could not open zip ${zipFilePath}. Reason: ${err.message}`);
          return resolve(Result.failure(err));
        }

        this.debugLogger.debug("Reading entries ...");

        zipFile.readEntry();

        zipFile.on("entry", (entry: Entry) => {
          this.debugLogger.debug(`entry: ${entry.fileName}`);

          if (/\/$/.test(entry.fileName)) {
            // directory entry
            this.debugLogger.debug("entry is a directory!");

            // Directory file names end with '/'.
            // Note that entries for directories themselves are optional.
            // An entry's fileName implicitly requires its parent directories to exist.
            zipFile.readEntry();
          } else {
            // file entry
            this.debugLogger.debug("entry is a file!");

            this.debugLogger.debug(`Opening read stream for ${entry.fileName} ...`);

            zipFile.openReadStream(entry, (err, readStream) => {
              if (err) {
                this.debugLogger.debug(
                  `Could not open read stream for ${entry.fileName}. Reason: ${err.message}`
                );
                return resolve(Result.failure(err));
              }

              readStream.on("end", () => {
                this.debugLogger.debug(`Read stream for ${entry.fileName} ended`);
                zipFile.readEntry();
              });

              const entryFileNameParts = entry.fileName.split("/");
              this.debugLogger.debug("entryFileNameParts", entryFileNameParts);

              if (entryFileNameParts.length > 1) {
                const entryFileNamePartsWithoutFileName = entryFileNameParts.slice(
                  0,
                  entryFileNameParts.length - 1
                );
                this.debugLogger.debug(
                  "entryFileNamePartsWithoutFileName",
                  entryFileNamePartsWithoutFileName
                );

                const downloadPathParts = [toPath, ...entryFileNamePartsWithoutFileName];
                this.debugLogger.debug("downloadPathParts", downloadPathParts);

                fs.mkdirSync(path.join(...downloadPathParts), { recursive: true });
              }

              const writePath = path.join(toPath, entry.fileName);
              this.debugLogger.debug(`Writing stream to ${writePath} ...`);
              fs.writeFileSync(writePath, "");
              const writeStream = fs.createWriteStream(writePath);
              readStream.pipe(writeStream);
            });
          }
        });

        zipFile.once("end", () => {
          this.debugLogger.info("zip file reading ended.");
          resolve(Result.success(null));
        });
      });
    });
  }

  private async injectValuesInJsonFile(filePath: string, values: Record<string, string>) {
    const jsonContent = readJsonFile(filePath);
    let jsonStr = JSON.stringify(jsonContent, undefined, 2);

    for (const key of Object.keys(values)) {
      const value = values[key];
      jsonStr = jsonStr.replace(`{{${key}}}`, value);
    }

    await writeFile(filePath, jsonStr, { flag: "w" });
  }

  private async installDependencies(projectDirectory: string): Promise<void> {
    this.infoLogger.info("Installing dependencies...");
    process.chdir(projectDirectory); // equivalent to "cd /some/path"
    await Executable.run("pnpm i");
    console.log();
  }
}
