import { HttpContext } from "./HttpContext";

export type RequestHandler<TResponse = void> = (
  context: HttpContext
) => TResponse | Promise<TResponse>;
