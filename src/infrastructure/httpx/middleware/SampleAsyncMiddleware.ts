import { AsyncMiddleware } from "@/core/httpx/middleware";
import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { inject, injectable } from "tsyringe";

@injectable()
export class SampleAsyncMiddleware extends AsyncMiddleware {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    super();
    this.logger = this.loggerProvider.createLogger(SampleAsyncMiddleware.name, { level: "info" });
  }

  async handleAsync(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): Promise<void> {
    this.logger.info(
      "This is an async middleware! The HTTP pipeline will continue in 1000 milliseconds..."
    );

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    this.logger.info("1000 milliseconds have passed asynchronously!");

    next();
  }
}
