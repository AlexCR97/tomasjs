import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { environment } from "@/environment";
import express from "express";
import { inject, injectable } from "tsyringe";

@injectable()
export class ApiBuilder {
  private readonly logger: ILogger;
  private readonly app: express.Express;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    this.logger = this.loggerProvider.createLogger(API_BUILDER_TOKEN);
    this.logger.debug("Initializing api...");

    this.app = express();

    this.app.use(
      express.json({
        type: "*/*", // TODO is this needed?
      })
    );
  }

  build() {
    const server = this.app.listen(environment.api.port, () => {
      console.log("Initialized api successfully!");
      this.logger.debug("Server address:", server.address());
    });
  }
}

export const API_BUILDER_TOKEN = ApiBuilder.name;
