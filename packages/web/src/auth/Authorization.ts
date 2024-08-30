import { isFunction, isInRange, isNotNull } from "@tomasjs/core/system";
import {
  IRequestContextReader,
  MiddlewareAggregate,
  MiddlewareFunction,
  RequestContextReader,
} from "@/server";

export type AuthorizationPolicyFunction = (
  context: AuthorizationContext
) => boolean | Promise<boolean>;

export type AuthorizationContext = {
  req: IRequestContextReader;
};

export function isAuthorizationPolicyFunction(obj: unknown): obj is AuthorizationPolicyFunction {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
}

export function authorization(policy: AuthorizationPolicyFunction): MiddlewareFunction[] {
  return new MiddlewareAggregate()
    .addInterceptor(async ({ req }) => {
      if (!req.user.authenticated) {
        return;
      }

      const reqReader = RequestContextReader.from(req);
      const authorized = await policy({ req: reqReader });

      if (authorized) {
        req.user.authorize();
      }
    })
    .addGuard(({ req }) => {
      return req.user.authenticated && req.user.authorized ? true : 403;
    })
    .get();
}
