import { AppSetupFunction } from "./AppSetupFunction";

export interface AppSetupFactory {
  create(): AppSetupFunction;
}

/**
 * Used for reflection.
 */
const methodName = "create"; // Please update accordingly to AppSetupFactory

/**
 * Used for reflection
 */
const argsCount = 0; // Please update accordingly to AppSetupFactory

export function isAppSetupFactory(obj: any): obj is AppSetupFactory {
  if (obj === undefined || obj === null) {
    return false;
  }

  const method = Reflect.get(obj, methodName) as Function;

  if (method === undefined || method === null) {
    return false;
  }

  return typeof method === "function" && method.name === methodName && method.length === argsCount;
}
