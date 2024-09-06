import { inject } from "@tomasjs/core/dependency-injection";
import { ProjectTemplateDownloader } from "./ProjectTemplateDownloader";
import { CONFIGURATION, IConfiguration } from "@tomasjs/core/configuration";
import { TomasError } from "@tomasjs/core/errors";
import { ILoggerBuilder, LOGGER_BUILDER } from "@tomasjs/core/logging";
import { GitHubTemplateDownloader } from "./GitHubTemplateDownloader";

export const PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN = "IProjectTemplateDownloaderFactory";

export interface IProjectTemplateDownloaderFactory {
  createProjectTemplateDownloader(): ProjectTemplateDownloader;
}

export class ProjectTemplateDownloaderFactory implements IProjectTemplateDownloaderFactory {
  constructor(
    @inject(CONFIGURATION)
    private readonly config: IConfiguration,

    @inject(LOGGER_BUILDER)
    private readonly loggerBuilder: ILoggerBuilder
  ) {}

  createProjectTemplateDownloader(): ProjectTemplateDownloader {
    const strategy = this.config
      .sectionOrThrow("templateDownloader")
      .sectionOrThrow("use")
      .valueOrThrow<string>("string");

    if (strategy === "github") {
      return new GitHubTemplateDownloader(this.loggerBuilder, this.config);
    }

    throw new TomasError("cli/UnsupportedStrategy", `Strategy not supported: "${strategy}"`, {
      data: { strategy },
    });
  }
}
