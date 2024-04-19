import { ProblemDetailsContent } from "@/content";
import { ErrorHandler } from "./ErrorHandler";
import { ProblemDetails } from "@/ProblemDetails";
import { statusCodes } from "@/statusCodes";
import { IRequestContext } from "./RequestContext";
import { TomasError } from "@tomasjs/core/errors";

export function problemDetailsErrorHandler(options?: { includeError?: boolean }): ErrorHandler {
  return async (req, res, err) => {
    const problemDetails = buildProblemDetails(req, err);
    const problemDetailsContent = ProblemDetailsContent.from(problemDetails);

    return await res
      .withHeaders({
        "content-type": problemDetailsContent.type,
      })
      .withStatus(statusCodes.internalServerError)
      .withContent(problemDetailsContent)
      .send();
  };

  function buildProblemDetails(req: IRequestContext, err: any): ProblemDetails {
    const problemDetails = new ProblemDetails({
      type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1",
      title: "Internal Server Error",
      status: statusCodes.internalServerError,
      details:
        "The server encountered an unexpected condition that prevented it from fulfilling the request.",
      instance: req.path,
    });

    if (options?.includeError === true) {
      const error = buildError(err);
      problemDetails.withExtension("error", error);
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
