import { HttpContext, HttpMethod } from "@/core";
import { RequestHandler } from "@/core/handlers";
import { Endpoint } from "./Endpoint";

export class AnonymousEndpoint<TResponse = any> extends Endpoint {
  constructor(
    readonly _method: HttpMethod,
    readonly _path: string,
    private readonly handler: RequestHandler<TResponse>
  ) {
    super();
  }
  handle(context: HttpContext) {
    return this.handler(context);
  }
}
