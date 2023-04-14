import { ClassConstructor } from "./ClassConstructor";
import { Token } from "./Token";

export function isClassConstructor<T = any>(token?: Token<T>): token is ClassConstructor<T> {
  return typeof token === "function";
}
