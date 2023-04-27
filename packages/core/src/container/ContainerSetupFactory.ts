import { ContainerSetupFunction } from "./ContainerSetupFunction";

export interface ContainerSetupFactory {
  create(): ContainerSetupFunction;
}

/**
 * Used for reflection.
 */
export const containerSetupFactoryMethodName = "create"; // Please update accordingly to ContainerSetupFactory

/**
 * Used for reflection
 */
export const containerSetupFactoryMethodArgCount = 0; // Please update accordingly to ContainerSetupFactory

export function isContainerSetupFactory(obj: any): obj is ContainerSetupFactory {
  if (obj === undefined || obj === null) {
    return false;
  }

  const method = Reflect.get(obj, containerSetupFactoryMethodName) as Function;

  if (method === undefined || method === null) {
    return false;
  }

  return (
    typeof method === "function" &&
    method.name === containerSetupFactoryMethodName &&
    method.length === containerSetupFactoryMethodArgCount
  );
}
