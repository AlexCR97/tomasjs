import { statusCodes } from "@/statusCodes";
import { Endpoint, EndpointContext, EndpointResponse } from "./Endpoint";
import { Middleware } from "./Middleware";
import { IRequestContext } from "./RequestContext";
import { UrlParser } from "./UrlParser";
import { HttpPipeline } from "./HttpPipeline";
import { IResponseWriter } from "./ResponseWriter";
import { MiddlewareAggregate } from "./MiddlewareAggregate";

export function endpointsMiddleware(endpoints: Endpoint[]): Middleware {
  return async (req, res, next) => {
    const endpointResponse = await handleRequest(req, res);

    if (endpointResponse !== null) {
      res
        .withContent(endpointResponse.content)
        .withHeaders(endpointResponse.headers)
        .withStatus(endpointResponse.status);
    }

    return await next();
  };

  async function handleRequest(
    req: IRequestContext,
    res: IResponseWriter
  ): Promise<EndpointResponse | null> {
    const urlParser = new UrlParser(req.url);

    const endpoint = endpoints.find(({ method, path }) => {
      return method === req.method && urlParser.matches(path);
    });

    if (endpoint === undefined) {
      return new EndpointResponse({
        status: statusCodes.notFound,
      });
    }

    const middlewareAggregate = new MiddlewareAggregate()
      .addMiddleware(...(endpoint.options?.middlewares ?? []))
      .addInterceptor(...(endpoint.options?.interceptors ?? []))
      .addGuard(...(endpoint.options?.guards ?? []));

    if (endpoint.options?.authentication) {
      middlewareAggregate.addAuthentication(endpoint.options.authentication);
    }

    if (endpoint.options?.authorization) {
      middlewareAggregate.addAuthorization(endpoint.options.authorization);
    }

    await new HttpPipeline(middlewareAggregate.get()).run(req, res);

    if (res.sent) {
      return null;
    }

    const context = EndpointContext.from(endpoint, req);
    return await endpoint.handler(context);
  }
}
