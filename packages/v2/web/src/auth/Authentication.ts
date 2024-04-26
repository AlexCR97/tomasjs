import { Middleware, MiddlewareAggregate } from "@/middleware";
import { IRequestContext } from "@/server";
import { IClaims } from "./Claims";

export type AuthenticationPolicy = (
  request: IRequestContext
) => AuthenticationPolicyResult | Promise<AuthenticationPolicyResult>;

export type AuthenticationPolicyResult = boolean | AuthenticationPolicyResultExtended;

export type AuthenticationPolicyResultExtended = {
  authenticated: boolean;
  claims?: IClaims;
};

export function authentication(policy: AuthenticationPolicy): Middleware[] {
  return new MiddlewareAggregate()
    .addInterceptor(async (req) => {
      const result = await policy(req);

      return typeof result === "boolean"
        ? tryAuthenticate(result)
        : tryAuthenticate(result.authenticated, result.claims);

      function tryAuthenticate(allow: boolean, claims?: IClaims) {
        if (allow) {
          req.user.authenticate(claims);
        }
      }
    })
    .addGuard((req) => {
      return req.user.authenticated ? true : 401;
    })
    .get();
}
