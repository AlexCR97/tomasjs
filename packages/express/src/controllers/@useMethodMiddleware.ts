import { MiddlewareParam } from "@/endpoints";
import { HttpMethodMetadata } from "./metadata";

export function useMethodMiddleware(middleware: MiddlewareParam) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = new HttpMethodMetadata(target, propertyKey);
    metadata.addMiddleware(middleware);
  };
}
