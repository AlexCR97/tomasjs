import { ResultFailure, ResultSuccess } from "@tomasjs/core/system";
import {
  DownloadResult,
  ProjectTemplateDownloader,
  TemplateType,
} from "./ProjectTemplateDownloader";
import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";

export class GoogleDriveTemplateDownloader implements ProjectTemplateDownloader {
  async download(
    type: TemplateType
  ): Promise<ResultFailure<Error> | ResultSuccess<DownloadResult>> {
    const auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/drive",
      credentials: {
        client_email: "",
      },
    });

    const service = google.drive({ version: "v3", auth });

    const files = await service.files.list({ pageSize: 10 });

    console.log("files", files);

    throw new Error("Method not implemented.");
  }
}
