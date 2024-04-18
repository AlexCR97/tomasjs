import { statusCodes } from "@/statusCodes";
import { Endpoint, EndpointContext, EndpointResponse } from "./Endpoint";
import { Middleware } from "./Middleware";
import { IRequestContext } from "./RequestContext";
import { UrlParser } from "./UrlParser";

export function endpointsMiddleware(endpoints: Endpoint[]): Middleware {
  return async (req, res, next) => {
    const endpointResponse = await handleRequest(req);

    await res
      .withContent(endpointResponse.content)
      .withHeaders(endpointResponse.headers)
      .withStatus(endpointResponse.status)
      .send();

    return await next();
  };

  async function handleRequest(req: IRequestContext): Promise<EndpointResponse> {
    const urlParser = new UrlParser(req.url);

    const endpoint = endpoints.find(({ method, path }) => {
      return method === req.method && urlParser.matches(path);
    });

    if (endpoint === undefined) {
      return new EndpointResponse({
        status: statusCodes.notFound,
      });
    }

    const context = EndpointContext.from(endpoint, req);

    return await endpoint.handler(context);
  }
}
