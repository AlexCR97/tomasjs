import { HttpResponse } from "@/server";
import { Middleware } from "@/middleware";
import { ProblemDetailsContent } from "@/content";
import { ProblemDetails } from "@/ProblemDetails";
import { IRequestContext, IResponseWriter } from "@/server";
import { InvalidOperationError } from "@tomasjs/core/errors";
import { httpStatus } from "@/HttpStatus";

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
    status: 401 | 403
  ) {
    const problemDetails = buildProblemDetails(req, status);
    const content = ProblemDetailsContent.from(problemDetails);
    const response = new HttpResponse({
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

  function buildProblemDetails(req: IRequestContext, status: 401 | 403): ProblemDetails {
    if (status === 401) {
      const { type, title, code: status, details } = httpStatus.unauthorized;
      return new ProblemDetails({
        type,
        title,
        status,
        details,
        instance: req.path,
      });
    }

    if (status === 403) {
      const { type, title, code: status, details } = httpStatus.forbidden;
      return new ProblemDetails({
        type,
        title,
        status,
        details,
        instance: req.path,
      });
    }

    throw new InvalidOperationError();
  }
}
