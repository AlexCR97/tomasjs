import { HttpResponse } from "@/server";
import { IRequestContext, IResponseWriter } from "@/server";
import { InvalidOperationError } from "@tomasjs/core/errors";
import { httpStatus } from "@/HttpStatus";
import { isNotNull, hasLength, isFunction } from "@/common";
import { ProblemDetails, ProblemDetailsContent } from "@/problems";
import { MiddlewareFunction } from "./Middleware";

export type GuardFunction = (context: GuardContext) => GuardResult | Promise<GuardResult>;

export type GuardContext = { req: IRequestContext };

export type GuardResult = boolean | 401 | 403;

export function isGuardFunction(obj: unknown): obj is GuardFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 1;
}

export function guard(guard: GuardFunction): MiddlewareFunction {
  return async ({ req, res, next }) => {
    const result = await guard({ req });

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
      return ProblemDetails.from({
        type,
        title,
        status,
        details,
        instance: req.path,
        extensions: {},
      });
    }

    if (status === 403) {
      const { type, title, code: status, details } = httpStatus.forbidden;
      return ProblemDetails.from({
        type,
        title,
        status,
        details,
        instance: req.path,
        extensions: {},
      });
    }

    throw new InvalidOperationError();
  }
}
