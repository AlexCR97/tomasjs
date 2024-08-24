import { ProblemDetailsContent } from "@/content";
import { ErrorHandlerFunction } from "./ErrorHandler";
import { statusCode } from "@/StatusCode";
import { IRequestContext } from "@/server";
import { TomasError } from "@tomasjs/core/errors";
import { httpStatus } from "@/HttpStatus";
import { ProblemDetails } from "@/problems";

// TODO Improve this
export function problemDetailsErrorHandler(options?: {
  includeError?: boolean;
}): ErrorHandlerFunction {
  return async ({ req, res, err }) => {
    const problemDetails = buildProblemDetails(req, err);
    const problemDetailsContent = ProblemDetailsContent.from(problemDetails);

    return await res
      .withHeaders({
        "content-type": problemDetailsContent.type,
      })
      .withStatus(statusCode.internalServerError)
      .withContent(problemDetailsContent)
      .send();
  };

  function buildProblemDetails(req: IRequestContext, err: any): ProblemDetails {
    const { type, title, code: status, details } = httpStatus.internalServerError;

    const problemDetails = new ProblemDetails(type, status, title, details, req.path, {});

    if (options?.includeError === true) {
      const error = buildError(err);
      problemDetails.extensions!["error"] = error;
    }

    return problemDetails;
  }

  function buildError(err: any): any {
    if (err === null || err === undefined) {
      return undefined;
    }

    if (err instanceof TomasError) {
      return {
        code: err.code,
        data: err.data,
        innerError: buildError(err.innerError),
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    }

    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    }

    return err;
  }
}
