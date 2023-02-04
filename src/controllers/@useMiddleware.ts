import { NotImplementedError } from "@/core/errors";
import { MiddlewareParam } from "@/endpoints/MiddlewareParam";

export function useMiddleware(middleware: MiddlewareParam) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    // TODO Implement useMiddleware decorator
    throw new NotImplementedError(useMiddleware.name);
  };
}
