import { MiddlewareParam } from "@/endpoints/MiddlewareParam";
import { ControllerMetadata } from "./metadata/ControllerMetadata";

export function useMiddleware(middleware: MiddlewareParam) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata = new ControllerMetadata(constructor);
    metadata.addMiddleware(middleware);
    return constructor;
  };
}
