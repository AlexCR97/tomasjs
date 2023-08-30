import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { Logger } from "@tomasjs/logging";
import { RequestHandler } from "express";

export interface UseFilesOptions {
  /**
   * Applies uri decoding to file names if set `true`.
   * @default false
   */
  uriDecodeFileNames?: boolean;

  /**
   * Returns a HTTP 413 when the file is bigger than the size limit if `true`.
   * Otherwise, it will add a `truncated = true` to the resulting file structure.
   * @default false
   */
  abortOnLimit?: boolean;

  /**
   * Response which will be send to client if file size limit exceeded when `abortOnLimit` set to `true`.
   * @default 'File size limit has been reached'
   */
  responseOnLimit?: string;

  /**
   * User defined limit handler which will be invoked if the file is bigger than configured limits.
   * @default false
   */
  limitHandler?: RequestHandler; // TODO Add DI support for this

  /**
   * This defines how long to wait for data before aborting. Set to `0` if you want to turn off timeout checks.
   * @default 60_000
   */
  uploadTimeout?: number;
}

export class UseFiles implements AppSetupFactory {
  private readonly options?: UseFilesOptions;
  private readonly logger?: Logger;

  constructor(options?: { options: UseFilesOptions; logger?: Logger }) {
    this.options = options?.options;
    this.logger = options?.logger;
  }

  create(): AppSetupFunction {
    return async (app) => {
      this.logger?.debug("Bootstrapping...");

      const { default: expressFileUpload } = await import("express-fileupload");

      app.use(
        expressFileUpload({
          uriDecodeFileNames: this.options?.uriDecodeFileNames,
          abortOnLimit: this.options?.abortOnLimit,
          responseOnLimit: this.options?.responseOnLimit,
          limitHandler: this.options?.limitHandler,
          uploadTimeout: this.options?.uploadTimeout,
        })
      );

      this.logger?.debug("Bootstrapped!");
    };
  }
}
