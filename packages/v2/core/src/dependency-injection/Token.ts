import { Constructor, isConstructor } from "./Constructor";
import { ServiceFactory, isServiceFactory } from "./ServiceFactory";

export type Token<T> = ConstructorToken<T> | ServiceFactoryToken<T> | ValueToken;

export type ConstructorToken<T> = Constructor<T>;

export type ServiceFactoryToken<T> = ServiceFactory<T>;

export type ValueToken = string;

export function isToken<T>(obj: any): obj is Token<T> {
  return isConstructor<T>(obj) || isServiceFactory<T>(obj) || isValueToken(obj);
}

export function isConstructorToken<T>(obj: any): obj is ConstructorToken<T> {
  return isConstructor<T>(obj);
}

export function isServiceFactoryToken<T>(obj: any): obj is ServiceFactoryToken<T> {
  return isServiceFactory<T>(obj);
}

export function isValueToken(obj: any): obj is ValueToken {
  return typeof obj === "string";
}
