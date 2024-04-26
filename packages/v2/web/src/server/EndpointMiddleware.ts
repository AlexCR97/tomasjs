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

    res
      .withContent(endpointResponse.content)
      .withHeaders(endpointResponse.headers)
      .withStatus(endpointResponse.status);

    return await next();
  };

  async function handleRequest(
    req: IRequestContext,
    res: IResponseWriter
  ): Promise<EndpointResponse> {
    const urlParser = new UrlParser(req.url);

    const endpoint = endpoints.find(({ method, path }) => {
      return method === req.method && urlParser.matches(path);
    });

    if (endpoint === undefined) {
      return new EndpointResponse({
        status: statusCodes.notFound,
      });
    }

    const middlewares = new MiddlewareAggregate()
      .addMiddleware(...(endpoint.options?.middlewares ?? []))
      .addInterceptor(...(endpoint.options?.interceptors ?? []))
      .addGuard(...(endpoint.options?.guards ?? []))
      .get();

    await new HttpPipeline(middlewares).run(req, res);

    const context = EndpointContext.from(endpoint, req);
    return await endpoint.handler(context);
  }
}
