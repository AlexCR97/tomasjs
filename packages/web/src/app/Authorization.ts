import { isNotNull, hasLength, isFunction, isInRange } from "@/common";
import { isGuardFunction } from "@/guard";
import { IRequestContextReader } from "./RequestContext";
import { Constructor } from "@tomasjs/core/system";

export type AuthorizationPolicyType =
  | AuthorizationPolicyFunction
  | IAuthorizationPolicy
  | Constructor<IAuthorizationPolicy>
  | IAuthorizationPolicyFactory
  | Constructor<IAuthorizationPolicyFactory>;

export type AuthorizationPolicyFunction = (
  context: AuthorizationContext
) => boolean | Promise<boolean>;

export type AuthorizationContext = {
  req: IRequestContextReader;
};

export function isAuthorizationPolicyFunction(obj: unknown): obj is AuthorizationPolicyFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 1);
}

export interface IAuthorizationPolicy {
  authorize(context: AuthorizationContext): boolean | Promise<boolean>;
}

export function isIAuthorizationPolicy(obj: unknown): obj is IAuthorizationPolicy {
  return isNotNull(obj) && isGuardFunction((obj as IAuthorizationPolicy)["authorize"]);
}

export interface IAuthorizationPolicyFactory {
  createAuthorizationPolicy(): AuthorizationPolicyFunction | IAuthorizationPolicy;
}

export function isIAuthorizationPolicyFactory(obj: unknown): obj is IAuthorizationPolicyFactory {
  return (
    isNotNull(obj) &&
    isAuthorizationPolicyFactoryFunction(
      (obj as IAuthorizationPolicyFactory)["createAuthorizationPolicy"]
    )
  );

  function isAuthorizationPolicyFactoryFunction(obj: unknown): boolean {
    return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 0;
  }
}
