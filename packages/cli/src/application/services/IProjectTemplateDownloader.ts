import { ResultFailure, ResultSuccess } from "@/common";
import { env } from "@/env";

export type ProjectTemplate = keyof typeof env.projectTemplates;

export const projectTemplateDownloaderToken = "ProjectTemplateDownloader";

export interface IProjectTemplateDownloader {
  download(template: ProjectTemplate, toPath: string): Promise<ResultSuccess<string> | ResultFailure<Error>>;
}
