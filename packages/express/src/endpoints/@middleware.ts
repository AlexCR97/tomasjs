import { EndpointPrototypeMetadata } from "./metadata";
import { MiddlewareParam } from "./MiddlewareParam";

export function middleware(middleware: MiddlewareParam) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata = new EndpointPrototypeMetadata(constructor);
    metadata.addMiddleware(middleware);
    return constructor;
  };
}
