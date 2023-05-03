import { MiddlewareType } from "@/middleware";
import { HttpMethodMetadata } from "./metadata";

export function useMethodMiddleware(...middlewares: MiddlewareType[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = new HttpMethodMetadata(target, propertyKey);

    for (const middleware of middlewares) {
      metadata.addMiddleware(middleware);
    }
  };
}
