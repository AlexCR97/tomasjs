import { EndpointMetadata } from "./EndpointMetadata";
import { MiddlewareParam } from "./MiddlewareParam";

export function middleware(middleware: MiddlewareParam) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super();
        const metadata = new EndpointMetadata<any>(this);
        metadata.addMiddleware(middleware);
      }
    };
  };
}
