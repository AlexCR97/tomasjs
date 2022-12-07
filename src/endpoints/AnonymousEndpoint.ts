import { HttpContext } from "@/core";
import { HttpMethod } from "@/HttpMethod";
import { ThomasRequestHandlerCallback } from "@/requests/types";
import { Endpoint } from "./Endpoint";

export class AnonymousEndpoint extends Endpoint {
  constructor(
    readonly _method: HttpMethod,
    readonly _path: string,
    private readonly handler: ThomasRequestHandlerCallback<any>
  ) {
    super();
  }
  handle<TResponse>(context: HttpContext): TResponse | Promise<TResponse> {
    return this.handler(context);
  }
}
