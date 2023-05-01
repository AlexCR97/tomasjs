import { MiddlewareType } from "@/middleware";
import { HttpMethodMetadata } from "./metadata";

export function useMethodMiddleware(middleware: MiddlewareType) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = new HttpMethodMetadata(target, propertyKey);
    metadata.addMiddleware(middleware);
  };
}
