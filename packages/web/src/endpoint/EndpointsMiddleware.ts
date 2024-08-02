import { statusCode } from "@/StatusCode";
import { EndpointContext, PlainEndpoint } from "./PlainEndpoint";
import { Middleware, MiddlewareAggregate } from "@/middleware";
import { IRequestContext, IResponseWriter, UrlParser, HttpPipeline, HttpResponse } from "@/server";

export function endpoints(endpoints: PlainEndpoint[]): Middleware {
  return async (req, res, next) => {
    const httpResponse = await handleRequest(req, res);

    if (httpResponse !== null) {
      res
        .withContent(httpResponse.content)
        .withHeaders(httpResponse.headers)
        .withStatus(httpResponse.status);
    }

    return await next();
  };

  async function handleRequest(
    req: IRequestContext,
    res: IResponseWriter
  ): Promise<HttpResponse | null> {
    const urlParser = new UrlParser(req.url);

    const endpoint = endpoints.find(({ method, path }) => {
      return method === req.method && urlParser.matches(path);
    });

    if (endpoint === undefined) {
      return new HttpResponse({
        status: statusCode.notFound,
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
