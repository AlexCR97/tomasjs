import { EndpointMetadata } from "./EndpointMetadata";

export function path(path: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super();
        const metadata = new EndpointMetadata<any>(this);
        metadata.path = path;
      }
    };
  };
}
