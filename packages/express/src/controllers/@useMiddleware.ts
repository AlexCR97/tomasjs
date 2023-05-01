import { MiddlewareType } from "@/middleware";
import { ControllerMetadata } from "./metadata";

/**
 * A decorator factory that adds middleware to a controller.
 *
 * @param middleware The middleware function or array of middleware functions to add.
 * @returns A decorator function that adds the specified middleware to the controller.
 */
export function useMiddleware(middleware: MiddlewareType) {
  /**
   * A decorator function that adds middleware to a controller.
   *
   * @template T The type of the constructor function.
   * @param constructor The constructor function to decorate.
   * @returns The decorated constructor function.
   */
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata = new ControllerMetadata(constructor);
    metadata.addMiddleware(middleware);
    return constructor;
  };
}
