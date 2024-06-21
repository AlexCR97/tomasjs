import { inject } from "@tomasjs/core/dependency-injection";
import { ProjectTemplateDownloader } from "./ProjectTemplateDownloader";
import { IConfiguration, configurationToken } from "@tomasjs/core/configuration";
import { MegaTemplateDownloader } from "./MegaTemplateDownloader";
import { TomasError } from "@tomasjs/core/errors";
import { ILoggerFactory, LoggerFactory } from "@tomasjs/core/logging";

export const PROJECT_TEMPLATE_DOWNLOADER_FACTORY_TOKEN = "IProjectTemplateDownloaderFactory";

export interface IProjectTemplateDownloaderFactory {
  createProjectTemplateDownloader(): ProjectTemplateDownloader;
}

export class ProjectTemplateDownloaderFactory implements IProjectTemplateDownloaderFactory {
  constructor(
    @inject(configurationToken)
    private readonly config: IConfiguration,

    @inject(LoggerFactory)
    private readonly loggerFactory: ILoggerFactory
  ) {}

  createProjectTemplateDownloader(): ProjectTemplateDownloader {
    const strategy = this.config
      .sectionOrThrow("templateDownloader")
      .sectionOrThrow("use")
      .valueOrThrow<ProjectTemplateDownloaderStrategy>("string");

    if (strategy === "mega") {
      return new MegaTemplateDownloader(this.loggerFactory, this.config);
    }

    throw new TomasError("cli/UnsupportedStrategy", `Strategy not supported: "${strategy}"`, {
      data: { strategy },
    });
  }
}

type ProjectTemplateDownloaderStrategy = "mega";
