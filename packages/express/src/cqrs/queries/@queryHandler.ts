import { ClassConstructor, injectable, internalContainer } from "@/container";
import { QueryHandlerMetadata, QueryHandlerToken } from "./metadata";

export function queryHandler<TQuery>(queryConstructor: ClassConstructor<TQuery>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    internalContainer.addClass(constructor, { token: QueryHandlerToken });
    const metadata = new QueryHandlerMetadata(constructor);
    metadata.queryConstructor = queryConstructor;
    return constructor;
  };
}
