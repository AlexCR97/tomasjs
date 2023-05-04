import { injectable } from "@tomasjs/core";
import { ControllerMetadata } from "./metadata/ControllerMetadata";
import { MiddlewareType } from "@/middleware";

interface ControllerOptions {
  middlewares?: MiddlewareType[];
}

export function controller(path?: string, options?: ControllerOptions) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    const metadata = new ControllerMetadata(constructor);
    metadata.path = path ?? "/";
    metadata.addMiddleware(...(options?.middlewares ?? []));
    return constructor;
  };
}
