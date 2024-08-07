import { MiddlewareFunction, MiddlewareAggregate } from "@/middleware";
import { IRequestContext } from "@/server";
import { IClaims } from "./Claims";
import { hasLength, isFunction, isNotNull } from "@/common";
import { isGuardFunction } from "@/guard";

export type AuthenticationPolicyResult = boolean | AuthenticationPolicyResultExtended;

export type AuthenticationPolicyResultExtended = {
  authenticated: boolean;
  claims?: IClaims;
};

export type AuthenticationPolicyFunction = (
  req: IRequestContext
) => AuthenticationPolicyResult | Promise<AuthenticationPolicyResult>;

export function isAuthenticationPolicyFunction(obj: unknown): obj is AuthenticationPolicyFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 1;
}

export interface IAuthenticationPolicy {
  authenticate(
    req: IRequestContext
  ): AuthenticationPolicyResult | Promise<AuthenticationPolicyResult>;
}

export function isIAuthenticationPolicy(obj: unknown): obj is IAuthenticationPolicy {
  return isNotNull(obj) && isGuardFunction((obj as IAuthenticationPolicy)["authenticate"]);
}

export interface IAuthenticationPolicyFactory {
  createAuthenticationPolicy(): AuthenticationPolicyFunction | IAuthenticationPolicy;
}

export function isIAuthenticationPolicyFactory(obj: unknown): obj is IAuthenticationPolicyFactory {
  return (
    isNotNull(obj) &&
    isAuthenticationPolicyFactoryFunction(
      (obj as IAuthenticationPolicyFactory)["createAuthenticationPolicy"]
    )
  );

  function isAuthenticationPolicyFactoryFunction(obj: unknown): boolean {
    return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 0;
  }
}

export function authentication(policy: AuthenticationPolicyFunction): MiddlewareFunction[] {
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
