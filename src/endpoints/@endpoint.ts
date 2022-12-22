import { injectable } from "@/container";
import { internalContainer } from "@/container";
import { HttpMethod } from "@/core";
import { EndpointPrototypeMetadata } from "./metadata";

export function endpoint(httpMethod: HttpMethod = "get") {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    internalContainer.addClass(constructor);
    const metadata = new EndpointPrototypeMetadata(constructor);
    metadata.httpMethod = httpMethod;
    return constructor;
  };
}
