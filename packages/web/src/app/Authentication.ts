import { IClaims } from "@/auth";
import { hasLength, isFunction, isInRange, isNotNull } from "@/common";
import { IRequestContext } from "./RequestContext";
import { Constructor } from "@tomasjs/core/system";

export type AuthenticationPolicyType =
  | AuthenticationPolicyFunction
  | IAuthenticationPolicy
  | Constructor<IAuthenticationPolicy>
  | IAuthenticationPolicyFactory
  | Constructor<IAuthenticationPolicyFactory>;

export type AuthenticationPolicyResult = boolean | AuthenticationPolicyResultExtended;

export type AuthenticationPolicyResultExtended = {
  authenticated: boolean;
  claims?: IClaims;
};

export type AuthenticationPolicyFunction = (
  req: IRequestContext
) => AuthenticationPolicyResult | Promise<AuthenticationPolicyResult>;

export function isAuthenticationPolicyFunction(obj: unknown): obj is AuthenticationPolicyFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 1);
}

export interface IAuthenticationPolicy {
  authenticate(
    req: IRequestContext
  ): AuthenticationPolicyResult | Promise<AuthenticationPolicyResult>;
}

export function isIAuthenticationPolicy(obj: unknown): obj is IAuthenticationPolicy {
  return (
    isNotNull(obj) && isAuthenticationPolicyFunction((obj as IAuthenticationPolicy)["authenticate"])
  );
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
