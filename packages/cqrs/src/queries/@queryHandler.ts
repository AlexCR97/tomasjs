import { ClassConstructor, injectable } from "@tomasjs/core";
import { QueryHandlerMetadata } from "./QueryHandlerMetadata";

export function queryHandler<TQuery>(queryConstructor: ClassConstructor<TQuery>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    const metadata = new QueryHandlerMetadata(constructor);
    metadata.queryConstructor = queryConstructor;
    return constructor;
  };
}
