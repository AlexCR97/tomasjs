import { NextFunction, Request, Response } from "express";
import "express-async-errors";
import { ErrorResponse } from "@/core/data/responses/ErrorResponse";
import { DomainError, StatusCodeError } from "@/core/errors";
import { ErrorMiddleware } from "../../../core/httpx/core/middleware";
import { inject, injectable } from "tsyringe";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";

@injectable()
export class ErrorHandlerMiddleware extends ErrorMiddleware {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    super();
    this.logger = this.loggerProvider.createLogger(ErrorHandlerMiddleware.name, { level: "info" });
    this.logger.debug(`new ${ErrorHandlerMiddleware.name}`);
  }

  handle(
    err: any,
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): void {
    this.logger.debug("Handling error...");

    let errorResponse: ErrorResponse;

    if (err instanceof StatusCodeError) {
      errorResponse = ErrorResponse.fromStatusCodeError(err);
    } else if (err instanceof DomainError) {
      errorResponse = ErrorResponse.fromDomainError(err);
    } else if (err instanceof Error) {
      errorResponse = ErrorResponse.fromError(err);
    } else {
      errorResponse = {
        status: 500,
        code: "Unhandled",
        message: "Unhandled error",
        details: { err },
      };
    }

    res.status(errorResponse.status).json(errorResponse);

    this.logger.debug("Error handled!", { errorResponse });
  }
}
