import { HttpContext } from "@/core";

export abstract class AsyncRequestHandler<TResponse = void> {
  abstract handleAsync(context: HttpContext): Promise<TResponse>;
}
