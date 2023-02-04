import { HttpMethod } from "@/core";

export function http(method: HttpMethod, path?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // TODO Implement http decorator
    return descriptor;
  };
}

export function get(path?: string) {
  return http("get", path);
}

export function post(path?: string) {
  return http("post", path);
}

export function put(path?: string) {
  return http("put", path);
}

export function patch(path?: string) {
  return http("patch", path);
}
