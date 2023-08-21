import { Result, ResultFailure, ResultSuccess } from "@/common";
import { injectable } from "@tomasjs/core";
import { TomasLogger } from "@tomasjs/logging";
import yauzl, { Entry, ZipFile } from "yauzl";
import fs from "fs";
import path from "path";

@injectable()
export class ZipService {
  private readonly logger = new TomasLogger(ZipService.name, "error");

  async unzip(zipFilePath: string, toPath: string): Promise<ResultSuccess | ResultFailure<Error>> {
    this.logger.debug(`Opening zip ${zipFilePath} ...`);

    return new Promise((resolve) => {
      yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipFile: ZipFile) => {
        if (err) {
          this.logger.debug(`Could not open zip ${zipFilePath}. Reason: ${err.message}`);
          return resolve(Result.failure(err));
        }

        this.logger.debug("Reading entries ...");

        zipFile.readEntry();

        zipFile.on("entry", (entry: Entry) => {
          this.logger.debug(`entry: ${entry.fileName}`);

          if (/\/$/.test(entry.fileName)) {
            // directory entry
            this.logger.debug("entry is a directory!");

            // Directory file names end with '/'.
            // Note that entries for directories themselves are optional.
            // An entry's fileName implicitly requires its parent directories to exist.
            zipFile.readEntry();
          } else {
            // file entry
            this.logger.debug("entry is a file!");

            this.logger.debug(`Opening read stream for ${entry.fileName} ...`);

            zipFile.openReadStream(entry, (err, readStream) => {
              if (err) {
                this.logger.debug(
                  `Could not open read stream for ${entry.fileName}. Reason: ${err.message}`
                );
                return resolve(Result.failure(err));
              }

              readStream.on("end", () => {
                this.logger.debug(`Read stream for ${entry.fileName} ended`);
                zipFile.readEntry();
              });

              const entryFileNameParts = entry.fileName.split("/");
              this.logger.debug("entryFileNameParts", entryFileNameParts);

              if (entryFileNameParts.length > 1) {
                const entryFileNamePartsWithoutFileName = entryFileNameParts.slice(
                  0,
                  entryFileNameParts.length - 1
                );
                this.logger.debug(
                  "entryFileNamePartsWithoutFileName",
                  entryFileNamePartsWithoutFileName
                );

                const downloadPathParts = [toPath, ...entryFileNamePartsWithoutFileName];
                this.logger.debug("downloadPathParts", downloadPathParts);

                fs.mkdirSync(path.join(...downloadPathParts), { recursive: true });
              }

              const writePath = path.join(toPath, entry.fileName);
              this.logger.debug(`Writing stream to ${writePath} ...`);
              fs.writeFileSync(writePath, "");
              const writeStream = fs.createWriteStream(`temp/${entry.fileName}`);
              readStream.pipe(writeStream);
            });
          }
        });

        zipFile.once("end", () => {
          this.logger.info("zip file reading ended.");
          resolve(Result.success(null));
        });
      });
    });
  }
}
