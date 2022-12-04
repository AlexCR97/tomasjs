import { HttpContext } from "@/core/HttpContext";

export abstract class RequestHandler<TResponse = void> {
  abstract handle(context: HttpContext): TResponse;
}
