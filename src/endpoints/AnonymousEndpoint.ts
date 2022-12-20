import { HttpContext, HttpMethod } from "@/core";
import { RequestHandler } from "@/core/handlers";
import { Endpoint } from "./Endpoint";
import { EndpointMetadata } from "./EndpointMetadata";

export class AnonymousEndpoint<TResponse = any> extends Endpoint {
  constructor(
    readonly method: HttpMethod,
    readonly path: string,
    private readonly handler: RequestHandler<TResponse>
  ) {
    super();
    const metadata = new EndpointMetadata(this);
    metadata.httpMethod = method;
    metadata.path = path;
  }
  handle(context: HttpContext) {
    return this.handler(context);
  }
}
