import { HttpContext } from "@/core";
import { RequestHandler as ThomasRequestHandler } from "@/core/handlers";
import { RequestHandler } from "./RequestHandler";

export class AnonymousRequestHandler<TResponse = void> extends RequestHandler<TResponse> {
  constructor(private readonly handler: ThomasRequestHandler<TResponse>) {
    super();
  }

  handle(context: HttpContext): TResponse | Promise<TResponse> {
    return this.handler(context);
  }
}
