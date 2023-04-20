import { ClassConstructor, globalContainer, injectable } from "@tomasjs/core";
import { QueryHandlerMetadata, QueryHandlerToken } from "./metadata";

export function queryHandler<TQuery>(queryConstructor: ClassConstructor<TQuery>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    globalContainer.addClass(constructor, { token: QueryHandlerToken });
    const metadata = new QueryHandlerMetadata(constructor);
    metadata.queryConstructor = queryConstructor;
    return constructor;
  };
}
