import { isNotNull, hasLength, isFunction } from "@/common";
import { MiddlewareFunction, MiddlewareAggregate } from "@/middleware";
import { IRequestContext } from "@/server";
import { IClaims } from "./Claims";

export type AuthenticationPolicyFunction = (
  context: AuthenticationContext
) => AuthenticationPolicyResult | Promise<AuthenticationPolicyResult>;

export type AuthenticationContext = { req: IRequestContext };

export type AuthenticationPolicyResult = boolean | AuthenticationPolicyResultExtended;

export type AuthenticationPolicyResultExtended = {
  authenticated: boolean;
  claims?: IClaims;
};

export function isAuthenticationPolicyFunction(obj: unknown): obj is AuthenticationPolicyFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 1;
}

export function authentication(policy: AuthenticationPolicyFunction): MiddlewareFunction[] {
  return new MiddlewareAggregate()
    .addInterceptor(async ({ req }) => {
      const result = await policy({ req });

      return typeof result === "boolean"
        ? tryAuthenticate(result)
        : tryAuthenticate(result.authenticated, result.claims);

      function tryAuthenticate(allow: boolean, claims?: IClaims) {
        if (allow) {
          req.user.authenticate(claims);
        }
      }
    })
    .addGuard(({ req }) => {
      return req.user.authenticated ? true : 401;
    })
    .get();
}
