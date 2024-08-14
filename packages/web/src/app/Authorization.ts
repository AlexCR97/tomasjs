import { isNotNull, hasLength, isFunction } from "@/common";
import { isGuardFunction } from "@/guard";
import { IRequestContextReader } from "./RequestContext";

export type AuthorizationPolicyFunction = (
  req: IRequestContextReader
) => boolean | Promise<boolean>;

export function isAuthorizationPolicyFunction(obj: unknown): obj is AuthorizationPolicyFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 1;
}

export interface IAuthorizationPolicy {
  authorize(req: IRequestContextReader): boolean | Promise<boolean>;
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
