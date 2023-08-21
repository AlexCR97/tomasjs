import { IProjectTemplateDownloader, ProjectTemplate } from "@/application/services";
import { inject, injectable } from "@tomasjs/core";
import { BlobDownloader } from "./azure";
import { ResultSuccess, ResultFailure, Result } from "@/common";
import path from "path";
import { TomasLogger } from "@tomasjs/logging";

@injectable()
export class ProjectTemplateDownloader implements IProjectTemplateDownloader {
  private readonly logger = new TomasLogger(ProjectTemplateDownloader.name, "error");

  constructor(@inject(BlobDownloader) private readonly blobDownloader: BlobDownloader) {}

  async download(
    template: ProjectTemplate,
    toPath: string
  ): Promise<ResultSuccess<string> | ResultFailure<Error>> {
    try {
      this.logger.debug(`Downloading "${template}" template to path "${toPath}" ...`);
      const downloadPath = path.join(toPath, `${template}.zip`);
      const { error } = await this.blobDownloader.download(`${template}.zip`, downloadPath);

      if (error) {
        this.logger.error("Could not download template. Reason: ", error.message);
        return Result.failure(error);
      }

      this.logger.debug("Template downloaded!");
      return Result.success(downloadPath);
    } catch (err) {
      if (err instanceof Error) {
        return Result.failure(err);
      }

      return Result.failure(new Error(`An unexpected error occurred: ${err}`));
    }
  }
}
