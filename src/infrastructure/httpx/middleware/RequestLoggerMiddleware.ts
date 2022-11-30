import { Middleware } from "@/core/httpx/core/middleware/core";
import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { inject, injectable } from "tsyringe";

@injectable()
export class RequestLoggerMiddleware extends Middleware {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    super();
    this.logger = this.loggerProvider.createLogger(RequestLoggerMiddleware.name);
  }

  handle(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): void {
    const logParts: string[] = [`${req.method} ${req.path}`];

    if (req.params !== undefined && req.params !== null) {
      // TODO Build query params string
    }

    if (req.body !== undefined && req.body !== null) {
      const bodyJson = JSON.stringify(req.body);
      logParts.push(`body: ${bodyJson}`);
    }

    const log = logParts.join(" | ");
    this.logger.info(log);

    next();
  }
}
