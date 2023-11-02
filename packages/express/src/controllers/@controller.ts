import { injectable } from "@tomasjs/core";
import { ControllerMetadata } from "./metadata/ControllerMetadata";
import { MiddlewareType } from "@/middleware";
import { GuardType } from "@/guards";
import { InterceptorType } from "@/interceptors";
import { AuthenticationMetadata, AuthorizationMetadata } from "@/auth";

interface ControllerOptions {
  middlewares?: MiddlewareType[];
  interceptors?: InterceptorType[];
  guards?: GuardType[];
  authenticate?: AuthenticationMetadata;
  authorize?: AuthorizationMetadata;
}

export function controller(path?: string, options?: ControllerOptions) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    const metadata = new ControllerMetadata(constructor);
    metadata.path = path ?? "/";
    metadata.addMiddleware(...(options?.middlewares ?? []));
    metadata.addInterceptor(...(options?.interceptors ?? []));
    metadata.addGuard(...(options?.guards ?? []));
    metadata.authenticate = options?.authenticate;
    metadata.authorize = options?.authorize;
    return constructor;
  };
}
