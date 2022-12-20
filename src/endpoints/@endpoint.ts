import { HttpMethod } from "@/core";
import { EndpointTokenFactory } from "./EndpointTokenFactory";

export function endpoint(httpMethod: HttpMethod = "get") {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      _injectionToken = EndpointTokenFactory.create(constructor);
      _endpoint_httpMethod: HttpMethod = httpMethod;
    };
  };
}
