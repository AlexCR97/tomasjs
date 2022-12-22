import { EndpointPrototypeMetadata } from "./metadata";

export function path(path: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata = new EndpointPrototypeMetadata(constructor);
    metadata.path = path;
    return constructor;
  };
}
