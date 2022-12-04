import { HttpContext } from "@/core";

export abstract class RequestHandler<TResponse = void> {
  abstract handle(context: HttpContext): TResponse | Promise<TResponse>;
}
