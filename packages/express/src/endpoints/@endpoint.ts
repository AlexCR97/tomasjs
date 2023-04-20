import { globalContainer, injectable } from "@tomasjs/core";
import { HttpMethod } from "@/core";
import { EndpointPrototypeMetadata } from "./metadata";

export function endpoint(httpMethod: HttpMethod = "get") {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    globalContainer.addClass(constructor);
    const metadata = new EndpointPrototypeMetadata(constructor);
    metadata.httpMethod = httpMethod;
    return constructor;
  };
}
