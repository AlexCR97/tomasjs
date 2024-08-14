import { isNotNull, hasLength, isFunction } from "@/common";
import { IRequestContext } from "./RequestContext";

export type GuardResult = boolean | 401 | 403;

export type GuardFunction = (request: IRequestContext) => GuardResult | Promise<GuardResult>;

export function isGuardFunction(obj: unknown): obj is GuardFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 1;
}

export interface IGuard {
  protect(req: IRequestContext): GuardResult | Promise<GuardResult>;
}

export function isIGuard(obj: unknown): obj is IGuard {
  return isNotNull(obj) && isGuardFunction((obj as IGuard)["protect"]);
}

export interface IGuardFactory {
  createGuard(): GuardFunction | IGuard;
}

export function isIGuardFactory(obj: unknown): obj is IGuardFactory {
  return isNotNull(obj) && isGuardFactoryFunction((obj as IGuardFactory)["createGuard"]);

  function isGuardFactoryFunction(obj: unknown): boolean {
    return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 0;
  }
}
