import { HttpMethod } from "@/core";
import { EndpointMetadata } from "./EndpointMetadata";

export function endpoint(httpMethod: HttpMethod = "get") {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super();
        const metadata = new EndpointMetadata<any>(this);
        metadata.httpMethod = httpMethod;
      }
    };
  };
}
