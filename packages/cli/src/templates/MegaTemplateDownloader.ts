import { ResultSuccess, ResultFailure, Result } from "@tomasjs/core/system";
import { File } from "megajs";
import {
  DownloadResult,
  ProjectTemplateDownloader,
  TemplateType,
} from "./ProjectTemplateDownloader";
import { existsSync } from "node:fs";
import { ILogger, LoggerFactory } from "@tomasjs/core/logging";
import { inject } from "@tomasjs/core/dependency-injection";
import { join } from "node:path";
import {  mkdir, writeFile } from "node:fs/promises";

export class MegaTemplateDownloader implements ProjectTemplateDownloader {
  private readonly logger: ILogger;

  constructor(
    @inject(LoggerFactory)
    loggerFactory: LoggerFactory
  ) {
    this.logger = loggerFactory.createLogger(MegaTemplateDownloader.name, "debug");
  }

  async download(
    type: TemplateType
  ): Promise<ResultSuccess<DownloadResult> | ResultFailure<Error>> {
    try {
      const url = this.getZipFileUrl(type);

      const zipFile = File.fromURL(url);
      await zipFile.loadAttributes();

      const zipFileName = zipFile.name;
      const zipFileBuffer = await zipFile.downloadBuffer({});

      const currentWorkingDirectory = process.cwd();
      this.logger.debug(`currentWorkingDirectory: ${currentWorkingDirectory}`);

      const downloadedPath = join(currentWorkingDirectory, "temp");
      this.logger.debug(`downloadedPath: ${downloadedPath}`);

      const downloadedFileName = join(downloadedPath, zipFileName!);
      this.logger.debug(`downloadedFileName: ${downloadedFileName}`);

      if (!existsSync(downloadedPath)) {
        await mkdir(downloadedPath);
      }

      await writeFile(downloadedFileName, zipFileBuffer);

      return Result.success({ downloadedPath, downloadedFileName });
    } catch (err) {
      if (err instanceof Error) {
        return Result.failure(err);
      }

      return Result.failure(new Error(`An unexpected error occurred: ${err}`));
    }
  }

  private getZipFileUrl(type: TemplateType): string {
    if (type === "empty") {
      return "https://mega.nz/file/Ej9A3L5b#GvdjfvSuFOcmHllqPPq1qZ2Zj9eekad2CtUdyoqBoYo";
    }

    throw new Error(`No url configured for template type "${type}"`);
  }
}
