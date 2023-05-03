import { MiddlewareType } from "@/middleware";
import { ControllerMetadata } from "./metadata";

/**
 * Adds middlewares to a controller.
 */
export function useMiddlewares(...middlewares: MiddlewareType[]) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata = new ControllerMetadata(constructor);

    for (const middleware of middlewares) {
      metadata.addMiddleware(middleware);
    }

    return constructor;
  };
}
