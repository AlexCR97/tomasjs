import { injectable } from "@tomasjs/core";
import { ControllerMetadata } from "./metadata/ControllerMetadata";
import { MiddlewareType } from "@/middleware";
import { GuardType } from "@/guards";

interface ControllerOptions {
  middlewares?: MiddlewareType[];
  guards?: GuardType[];
}

export function controller(path?: string, options?: ControllerOptions) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    const metadata = new ControllerMetadata(constructor);
    metadata.path = path ?? "/";
    metadata.addMiddleware(...(options?.middlewares ?? []));
    metadata.addGuard(...(options?.guards ?? []));
    return constructor;
  };
}
