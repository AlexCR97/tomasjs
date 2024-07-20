import { ResultFailure, ResultSuccess } from "@tomasjs/core/system";

export const PROJECT_TEMPLATE_DOWNLOADER = "ProjectTemplateDownloader";

export interface ProjectTemplateDownloader {
  download(type: TemplateType): Promise<ResultSuccess<DownloadResult> | ResultFailure<Error>>;
}

export type TemplateType = "empty" | "console";

export type DownloadResult = {
  downloadedPath: string;
  downloadedFileName: string;
};
