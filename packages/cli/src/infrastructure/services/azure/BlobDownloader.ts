import { Result, ResultFailure, ResultSuccess } from "@/common";
import { env } from "@/env";
import { ContainerClient } from "@azure/storage-blob";
import { TomasError, injectable } from "@tomasjs/core";

@injectable()
export class BlobDownloader {
  private readonly containerClient = new ContainerClient(
    env.azure.storageAccount.connectionString,
    env.azure.storageAccount.containerName
  );

  async download(
    blobName: string,
    filePath: string
  ): Promise<ResultSuccess | ResultFailure<Error>> {
    const blobClient = this.containerClient.getBlobClient(blobName);
    const { _response } = await blobClient.downloadToFile(filePath);

    return _response.status >= 200 && _response.status <= 299
      ? Result.success(null)
      : Result.failure(
          new TomasError(
            `Could not download blob "${this.containerClient.containerName}/${blobName}"`
          )
        );
  }
}
