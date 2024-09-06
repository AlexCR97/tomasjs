import { ServerResponse } from "@/server";
import { IRequestContext, IResponseWriter } from "@/server";
import { InvalidOperationError } from "@tomasjs/core/errors";
import { isFunction, isInRange, isNotNull } from "@tomasjs/core/system";
import { MiddlewareFunction } from "./Middleware";
import { HTTP_STATUS, ProblemDetails, ProblemDetailsContent } from "@tomasjs/core/http";

export type GuardFunction = (context: GuardContext) => GuardResult | Promise<GuardResult>;

export type GuardContext = { req: IRequestContext };

export type GuardResult = boolean | 401 | 403;

export function isGuardFunction(obj: unknown): obj is GuardFunction {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
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
    const response = new ServerResponse({
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
      const { type, title, code: status, details } = HTTP_STATUS.unauthorized;
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
      const { type, title, code: status, details } = HTTP_STATUS.forbidden;
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
