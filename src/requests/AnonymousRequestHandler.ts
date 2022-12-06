import { HttpContext } from "@/core";
import { RequestHandler as ThomasRequestHandler } from "@/core/handlers";
import { HttpMethod } from "@/HttpMethod";
import { RequestHandler } from "./RequestHandler";

export class AnonymousRequestHandler<TResponse = void> extends RequestHandler<TResponse> {
  constructor(
    readonly _method: HttpMethod, // TODO Make private?
    readonly _path: string, // TODO Make private?
    private readonly handler: ThomasRequestHandler<TResponse>
  ) {
    super();
  }

  handle(context: HttpContext): TResponse | Promise<TResponse> {
    return this.handler(context);
  }
}
