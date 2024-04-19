import { statusCodes } from "@/statusCodes";
import { EndpointResponse } from "./Endpoint";
import { Middleware } from "./Middleware";
import { IRequestContext } from "./RequestContext";
import { ProblemDetailsContent } from "@/content";
import { ProblemDetails } from "@/ProblemDetails";
import { IResponseWriter } from "./ResponseWriter";

export type Guard = GuardFunction;
export type GuardFunction = (request: IRequestContext) => GuardResult | Promise<GuardResult>;
export type GuardResult = boolean; // TODO Add UnauthorizedResponse and ForbiddenResponse

export function guard(guard: Guard): Middleware {
  return async (req, res, next) => {
    const result = await guard(req);

    if (result === true) {
      return await next();
    }

    return await respondWithAccessDenial(req, res);
  };

  async function respondWithAccessDenial(req: IRequestContext, res: IResponseWriter) {
    const content = ProblemDetailsContent.from(
      new ProblemDetails({
        type: "https://datatracker.ietf.org/doc/html/rfc7235#section-3.1",
        title: "Unauthorized",
        status: statusCodes.unauthorized,
        details:
          "The request has not been applied because it lacks valid authentication credentials for the target resource.",
        instance: req.path,
      })
    );

    const response = new EndpointResponse({
      status: statusCodes.unauthorized,
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
}
