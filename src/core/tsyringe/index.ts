import { InjectionToken } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";

/**
 * This is a partial copy of the isConstructorToken function from the tsyringe source code.
 *
 * More info at https://github.com/microsoft/tsyringe/blob/master/src/providers/injection-token.ts
 */
export function isConstructorToken<T = any>(token?: InjectionToken<T>): token is constructor<T> {
  return typeof token === "function";
}
