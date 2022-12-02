import { Middleware } from "@/middleware";
import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { inject, injectable } from "tsyringe";

@injectable()
export class SampleOnBeforeMiddleware extends Middleware {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) readonly loggerProvider: ILoggerProvider) {
    super();
    this.logger = loggerProvider.createLogger(SampleOnBeforeMiddleware.name);
  }

  handle(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): void {
    this.logger.info(`The ${SampleOnBeforeMiddleware.name} got triggered!`);
    next();
  }
}
