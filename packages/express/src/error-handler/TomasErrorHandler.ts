import { TomasError, injectable } from "@tomasjs/core";
import { NextFunction, Request, Response } from "express";
import { ProblemDetails, statusCodes } from "@/core";
import { ProblemDetailsError, StatusCodeError } from "@/errors";
import { ProblemDetailsResponse, ResponseAdapter } from "@/responses";
import { ErrorHandler } from "./ErrorHandler";
import { Logger } from "@tomasjs/logging";

@injectable()
export class TomasErrorHandler implements ErrorHandler {
  private req!: Request;
  private res!: Response;
  private next!: NextFunction;

  constructor(
    private readonly options?: {
      includeStackTrace?: boolean;
      logger?: Logger;
    }
  ) {}

  private get includeStackTrace(): boolean {
    return this.options?.includeStackTrace ?? false;
  }

  private get logger(): Logger | undefined {
    return this.options?.logger;
  }

  catch(error: any, req: Request, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;

    this.logger?.error(`Caught error: ${error}`);

    try {
      if (error instanceof ProblemDetailsError) {
        this.logger?.debug("The error is an instance of ProblemDetailsError");
        return this.respondWithProblemDetails(error);
      }

      if (error instanceof StatusCodeError) {
        this.logger?.debug("The error is an instance of StatusCodeError");
        return this.respondWithStatusCode(error);
      }

      if (error instanceof TomasError) {
        this.logger?.debug("The error is an instance of TomasError");
        return this.respondWithTomasError(error);
      }

      if (error instanceof Error) {
        this.logger?.debug("The error is an instance of Error");
        return this.respondWithError(error);
      }

      this.logger?.debug("The error is an unknown error");
      return this.respondWithUnknownError(error);
    } catch {
      this.logger?.debug("An unexpected error ocurred. The express error handler will be used.");
      return this.respondWithExpressDefault(error);
    }
  }

  private respondWithProblemDetails(error: ProblemDetailsError) {
    ResponseAdapter.fromThomasToExpress(this.res, new ProblemDetailsResponse(error.problemDetails));
  }

  private respondWithStatusCode(error: StatusCodeError) {
    ResponseAdapter.fromThomasToExpress(
      this.res,
      new ProblemDetailsResponse(
        new ProblemDetails({
          type: error.name,
          instance: this.req.path,
          status: error.status,
          title: "An unexpected error ocurred",
          details: error.message,
          extensions: {
            stackTrace: this.includeStackTrace ? error.stack : undefined,
            data: error.data,
            innerError: error.innerError,
          },
        })
      )
    );
  }

  private respondWithTomasError(error: TomasError) {
    ResponseAdapter.fromThomasToExpress(
      this.res,
      new ProblemDetailsResponse(
        new ProblemDetails({
          type: error.name,
          instance: this.req.path,
          status: statusCodes.internalServerError,
          title: "An unexpected error ocurred",
          details: error.message,
          extensions: {
            stackTrace: this.includeStackTrace ? error.stack : undefined,
            data: error.data,
            innerError: error.innerError,
          },
        })
      )
    );
  }

  private respondWithError(error: Error) {
    ResponseAdapter.fromThomasToExpress(
      this.res,
      new ProblemDetailsResponse(
        new ProblemDetails({
          type: error.name,
          instance: this.req.path,
          status: statusCodes.internalServerError,
          title: "An unexpected error ocurred",
          details: error.message,
          extensions: {
            stackTrace: this.includeStackTrace ? error.stack : undefined,
          },
        })
      )
    );
  }

  private respondWithUnknownError(error: any) {
    ResponseAdapter.fromThomasToExpress(
      this.res,
      new ProblemDetailsResponse(
        new ProblemDetails({
          type: "Unknown",
          instance: this.req.path,
          status: statusCodes.internalServerError,
          title: "An unknown error ocurred",
          extensions: {
            error,
          },
        })
      )
    );
  }

  private respondWithExpressDefault(error: any) {
    this.next(error);
  }
}
