import { AppTeardownFunction } from "./AppTeardownFunction";

export interface AppTeardownFactory {
  create(): AppTeardownFunction;
}

/**
 * Used for reflection.
 */
const methodName = "create"; // Please update accordingly to AppTeardownFactory

/**
 * Used for reflection
 */
const argsCount = 0; // Please update accordingly to AppTeardownFactory

export function isAppTeardownFactory(obj: any): obj is AppTeardownFactory {
  if (obj === undefined || obj === null) {
    return false;
  }

  const method = Reflect.get(obj, methodName) as Function;

  if (method === undefined || method === null) {
    return false;
  }

  return typeof method === "function" && method.name === methodName && method.length === argsCount;
}
