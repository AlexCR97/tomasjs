import { HttpContext } from "@/core";
import { HttpMethod } from "@/HttpMethod";
import { ThomasRequestHandlerCallback } from "@/requests/types";
import { Endpoint } from "./Endpoint";

export class AnonymousEndpoint<TResponse = any> extends Endpoint {
  constructor(
    readonly _method: HttpMethod,
    readonly _path: string,
    private readonly handler: ThomasRequestHandlerCallback<TResponse>
  ) {
    super();
  }
  handle(context: HttpContext) {
    return this.handler(context);
  }
}
