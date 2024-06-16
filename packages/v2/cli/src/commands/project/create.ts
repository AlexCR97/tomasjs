import { Command } from "commander";
import { input, select } from "@inquirer/prompts";
import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";
import { Logger } from "@tomasjs/core/logging";
import { Configuration } from "@tomasjs/core/configuration";
import path, { join } from "path";
import fs, { existsSync } from "fs";
import { copyFile, mkdir, rm } from "fs/promises";
import yauzl, { Entry, ZipFile } from "yauzl";
import { execSync } from "node:child_process";

const logger = new Logger("createCommand", "debug", new Configuration([]));

export const createCommand = new Command()
  .name("create")
  .description("Creates a new TomasJS project")
  .action(async () => {
    const projectName = await inputProjectName();

    const projectTemplate = await selectProjectTemplateType();

    console.log("Creating project directory...");
    const projectDirectoryResult = createProjectDirectory(projectName);

    if (projectDirectoryResult.error) {
      console.error(projectDirectoryResult.error);
      return;
    }

    console.log("Downloading project template...");
    const templateDownloadResult = await downloadProjectTemplate(projectTemplate);

    if (templateDownloadResult.error) {
      console.error(templateDownloadResult.error);
      return;
    }

    console.log("Unzipping project template...");
    const unzipResult = await unzip(
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

    installDependencies(projectDirectoryResult.data!.projectDirectory);

    console.log("Your TomasJS project has been created!");
    console.log("Next steps:");
    console.log(`$ cd ./${projectName}`);
    console.log("$ pnpm dev");

    function inputProjectName(): Promise<string> {
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

    function selectProjectTemplateType(): Promise<string> {
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
          {
            value: "web",
            name: "Web App",
          },
        ],
      });
    }

    function createProjectDirectory(
      projectName: string
    ): ResultSuccess<{ projectDirectory: string }> | ResultFailure<string> {
      try {
        const currentWorkingDirectory = process.cwd();
        logger.debug(`currentWorkingDirectory: ${currentWorkingDirectory}`);

        const projectDirectory = path.join(currentWorkingDirectory, projectName);
        logger.debug(`projectDirectory: ${projectDirectory}`);

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

    async function downloadProjectTemplate(
      templateName: string
    ): Promise<
      ResultSuccess<{ downloadedPath: string; downloadedFileName: string }> | ResultFailure<string>
    > {
      try {
        const currentWorkingDirectory = process.cwd();
        logger.debug(`currentWorkingDirectory: ${currentWorkingDirectory}`);

        const templateFileName = `${templateName}.zip`;

        const templatePath = join(currentWorkingDirectory, "templates", templateFileName);
        logger.debug(`templatePath: ${templatePath}`);

        const downloadedPath = join(currentWorkingDirectory, "temp");
        logger.debug(`downloadedPath: ${downloadedPath}`);

        const downloadedFileName = join(downloadedPath, templateFileName);
        logger.debug(`downloadedFileName: ${downloadedFileName}`);

        if (!existsSync(downloadedPath)) {
          await mkdir(downloadedPath);
        }

        await copyFile(templatePath, downloadedFileName);

        return Result.success({ downloadedPath, downloadedFileName });
      } catch (err) {
        if (err instanceof Error) {
          return Result.failure(err.message);
        }

        return Result.failure(`An unexpected error occurred: ${err}`);
      }
    }

    async function unzip(
      zipFilePath: string,
      toPath: string
    ): Promise<ResultSuccess | ResultFailure<Error>> {
      logger.debug(`Opening zip ${zipFilePath} ...`);

      return new Promise((resolve) => {
        yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipFile: ZipFile) => {
          if (err) {
            logger.debug(`Could not open zip ${zipFilePath}. Reason: ${err.message}`);
            return resolve(Result.failure(err));
          }

          logger.debug("Reading entries ...");

          zipFile.readEntry();

          zipFile.on("entry", (entry: Entry) => {
            logger.debug(`entry: ${entry.fileName}`);

            if (/\/$/.test(entry.fileName)) {
              // directory entry
              logger.debug("entry is a directory!");

              // Directory file names end with '/'.
              // Note that entries for directories themselves are optional.
              // An entry's fileName implicitly requires its parent directories to exist.
              zipFile.readEntry();
            } else {
              // file entry
              logger.debug("entry is a file!");

              logger.debug(`Opening read stream for ${entry.fileName} ...`);

              zipFile.openReadStream(entry, (err, readStream) => {
                if (err) {
                  logger.debug(
                    `Could not open read stream for ${entry.fileName}. Reason: ${err.message}`
                  );
                  return resolve(Result.failure(err));
                }

                readStream.on("end", () => {
                  logger.debug(`Read stream for ${entry.fileName} ended`);
                  zipFile.readEntry();
                });

                const entryFileNameParts = entry.fileName.split("/");
                logger.debug("entryFileNameParts", entryFileNameParts);

                if (entryFileNameParts.length > 1) {
                  const entryFileNamePartsWithoutFileName = entryFileNameParts.slice(
                    0,
                    entryFileNameParts.length - 1
                  );
                  logger.debug(
                    "entryFileNamePartsWithoutFileName",
                    entryFileNamePartsWithoutFileName
                  );

                  const downloadPathParts = [toPath, ...entryFileNamePartsWithoutFileName];
                  logger.debug("downloadPathParts", downloadPathParts);

                  fs.mkdirSync(path.join(...downloadPathParts), { recursive: true });
                }

                const writePath = path.join(toPath, entry.fileName);
                logger.debug(`Writing stream to ${writePath} ...`);
                fs.writeFileSync(writePath, "");
                const writeStream = fs.createWriteStream(writePath);
                readStream.pipe(writeStream);
              });
            }
          });

          zipFile.once("end", () => {
            logger.info("zip file reading ended.");
            resolve(Result.success(null));
          });
        });
      });
    }

    function installDependencies(projectDirectory: string) {
      console.log("Installing project dependencies...");

      process.chdir(projectDirectory); // equivalent to "cd /some/path"
      execSync("pnpm i");
    }
  });
