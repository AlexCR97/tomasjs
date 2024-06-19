import { Configuration } from "@tomasjs/core/configuration";
import { Logger } from "@tomasjs/core/logging";
import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  DownloadResult,
  ProjectTemplateDownloader,
  TemplateType,
} from "./ProjectTemplateDownloader";

export class LocalTemplateDownloader implements ProjectTemplateDownloader {
  private readonly logger = new Logger(
    LocalTemplateDownloader.name,
    "debug",
    new Configuration([])
  );

  async download(
    type: TemplateType
  ): Promise<ResultFailure<Error> | ResultSuccess<DownloadResult>> {
    try {
      const currentWorkingDirectory = process.cwd();
      this.logger.debug(`currentWorkingDirectory: ${currentWorkingDirectory}`);

      const templateFileName = `${type}.zip`;

      const templatePath = join(currentWorkingDirectory, "templates", templateFileName);
      this.logger.debug(`templatePath: ${templatePath}`);

      const downloadedPath = join(currentWorkingDirectory, "temp");
      this.logger.debug(`downloadedPath: ${downloadedPath}`);

      const downloadedFileName = join(downloadedPath, templateFileName);
      this.logger.debug(`downloadedFileName: ${downloadedFileName}`);

      if (!existsSync(downloadedPath)) {
        await mkdir(downloadedPath);
      }

      await copyFile(templatePath, downloadedFileName);

      return Result.success({ downloadedPath, downloadedFileName });
    } catch (err) {
      if (err instanceof Error) {
        return Result.failure(err);
      }

      return Result.failure(new Error(`An unexpected error occurred: ${err}`));
    }
  }
}
