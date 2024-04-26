import { statusCodes } from "@/statusCodes";
import { EndpointResponse } from "@/endpoint";
import { Middleware } from "@/middleware";
import { ProblemDetailsContent } from "@/content";
import { ProblemDetails } from "@/ProblemDetails";
import { IRequestContext, IResponseWriter } from "@/server";
import { InvalidOperationError } from "@tomasjs/core/errors";

export type Guard = (request: IRequestContext) => GuardResult | Promise<GuardResult>;
export type GuardResult = boolean | 401 | 403;

export function guard(guard: Guard): Middleware {
  return async (req, res, next) => {
    const result = await guard(req);

    if (result === true) {
      return await next();
    }

    const statusCode = result === false ? 401 : result;

    return await respondWithAccessDenial(req, res, statusCode);
  };

  async function respondWithAccessDenial(
    req: IRequestContext,
    res: IResponseWriter,
    statusCode: 401 | 403
  ) {
    const problemDetails = buildProblemDetails(req, statusCode);
    const content = ProblemDetailsContent.from(problemDetails);
    const response = new EndpointResponse({
      status: problemDetails.status,
      content,
      headers: {
        "content-type": content.type,
      },
    });

    return await res
      .withHeaders(response.headers)
      .withStatus(response.status)
      .withContent(response.content)
      .send();
  }

  function buildProblemDetails(req: IRequestContext, statusCode: 401 | 403): ProblemDetails {
    if (statusCode === 401) {
      return new ProblemDetails({
        type: "https://datatracker.ietf.org/doc/html/rfc7235#section-3.1",
        title: "Unauthorized",
        status: statusCodes.unauthorized,
        details:
          "The request has not been applied because it lacks valid authentication credentials for the target resource.",
        instance: req.path,
      });
    }

    if (statusCode === 403) {
      return new ProblemDetails({
        type: "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.3",
        title: "Forbidden",
        status: statusCodes.forbidden,
        details: "The server understood the request but refuses to authorize it.",
        instance: req.path,
      });
    }

    throw new InvalidOperationError();
  }
}
