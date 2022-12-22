import { EndpointMetadata } from "./EndpointMetadata";

export function path(path: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata = new EndpointMetadata(constructor);
    metadata.path = path;
    return constructor;
  };
}
