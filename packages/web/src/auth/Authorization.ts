import { isNotNull, hasLength, isFunction } from "@/common";
import { MiddlewareFunction, MiddlewareAggregate } from "@/middleware";
import { IRequestContextReader, RequestContextReader } from "@/server";

export type AuthorizationPolicyFunction = (
  req: IRequestContextReader
) => boolean | Promise<boolean>;

export function isAuthorizationPolicyFunction(obj: unknown): obj is AuthorizationPolicyFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 1;
}

export function authorization(policy: AuthorizationPolicyFunction): MiddlewareFunction[] {
  return new MiddlewareAggregate()
    .addInterceptor(async (req) => {
      if (!req.user.authenticated) {
        return;
      }

      const reqReader = RequestContextReader.from(req);
      const authorized = await policy(reqReader);

      if (authorized) {
        req.user.authorize();
      }
    })
    .addGuard((req) => {
      return req.user.authenticated && req.user.authorized ? true : 403;
    })
    .get();
}
