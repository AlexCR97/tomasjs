import { ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { BlobDownloader } from "./services/azure";
import { ProjectTemplateDownloader } from "./services";
import { projectTemplateDownloaderToken } from "@/application/services";

export class UseInfrastructure implements ContainerSetupFactory {
  create(): ContainerSetupFunction {
    return (container) => {
      container
        .addClass(ProjectTemplateDownloader, { token: projectTemplateDownloaderToken })
        .addClass(BlobDownloader);
    };
  }
}
