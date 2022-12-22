import { HttpMethod } from "@/core";
import { EndpointMetadata } from "./EndpointMetadata";

export function endpoint(httpMethod: HttpMethod = "get") {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata = new EndpointMetadata(constructor);
    metadata.httpMethod = httpMethod;
    return constructor;
  };
}
