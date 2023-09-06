import { Logger, TomasError, TomasLogger, injectable } from "@tomasjs/core";
import {
  HttpContext,
  HttpNextFunction,
  HttpRequest,
  HttpResponseWriter,
  ProblemDetails,
  statusCodes,
} from "@/core";
import { ProblemDetailsError, StatusCodeError } from "@/errors";
import { ProblemDetailsResponse } from "@/responses";
import { ErrorHandler } from "./ErrorHandler";

@injectable()
export class TomasErrorHandler implements ErrorHandler {
  private readonly logger: Logger = new TomasLogger(TomasErrorHandler.name, "error");
  private readonly includeStackTrace: boolean;

  private req!: HttpRequest;
  private res!: HttpResponseWriter;
  private next!: HttpNextFunction;

  constructor(options?: { includeStackTrace?: boolean }) {
    this.includeStackTrace = options?.includeStackTrace ?? false;
  }

  catch(error: any, { request, response }: HttpContext, next: HttpNextFunction) {
    this.req = request;
    this.res = response;
    this.next = next;

    this.logger.error(`Caught error: ${error}`);

    try {
      if (error instanceof ProblemDetailsError) {
        this.logger.debug("The error is an instance of ProblemDetailsError");
        return this.respondWithProblemDetails(error);
      }

      if (error instanceof StatusCodeError) {
        this.logger.debug("The error is an instance of StatusCodeError");
        return this.respondWithStatusCode(error);
      }

      if (error instanceof TomasError) {
        this.logger.debug("The error is an instance of TomasError");
        return this.respondWithTomasError(error);
      }

      if (error instanceof Error) {
        this.logger.debug("The error is an instance of Error");
        return this.respondWithError(error);
      }

      this.logger.debug("The error is an unknown error");
      return this.respondWithUnknownError(error);
    } catch {
      this.logger.debug("An unexpected error ocurred. The express error handler will be used.");
      return this.respondWithExpressDefault(error);
    }
  }

  private respondWithProblemDetails(error: ProblemDetailsError) {
    this.res.send(new ProblemDetailsResponse(error.problemDetails));
  }

  private respondWithStatusCode(error: StatusCodeError) {
    this.res.send(
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
    this.res.send(
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
    this.res.send(
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
    this.res.send(
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
