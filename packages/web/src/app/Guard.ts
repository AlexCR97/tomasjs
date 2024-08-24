import { IServiceProvider } from "@tomasjs/core/dependency-injection";
import { Constructor } from "@tomasjs/core/system";
import { isNotNull, hasLength, isFunction, isInRange } from "@/common";
import { IRequestContext } from "@/server";

export type GuardType =
  | GuardFunction
  | IGuard
  | Constructor<IGuard>
  | IGuardFactory
  | Constructor<IGuardFactory>;

export type GuardFunction = (context: GuardContext) => GuardResult | Promise<GuardResult>;

export type GuardContext = { req: IRequestContext; services: IServiceProvider };

export type GuardResult = boolean | 401 | 403;

export function isGuardFunction(obj: unknown): obj is GuardFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 1);
}

export interface IGuard {
  protect(context: GuardContext): GuardResult | Promise<GuardResult>;
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
