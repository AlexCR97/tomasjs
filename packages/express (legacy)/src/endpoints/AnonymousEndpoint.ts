import { HttpContext, HttpMethod } from "@/core";
import { RequestHandler } from "@/core/handlers";
import { Endpoint } from "./Endpoint";
import { AnonymousEndpointMetadata } from "./metadata";

export class AnonymousEndpoint<TResponse = any> implements Endpoint {
  constructor(
    readonly method: HttpMethod,
    readonly path: string,
    private readonly handler: RequestHandler<TResponse>
  ) {
    const metadata = new AnonymousEndpointMetadata(this);
    metadata.httpMethod = method;
    metadata.path = path;
  }
  handle(context: HttpContext) {
    return this.handler(context);
  }
}
