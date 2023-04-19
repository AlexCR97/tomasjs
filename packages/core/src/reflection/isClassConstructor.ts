import { Token } from "@/container";
import { ClassConstructor } from "./ClassConstructor";

export function isClassConstructor<T = any>(token?: Token<T>): token is ClassConstructor<T> {
  // TODO Improve type check (maybe check that function has name?)
  return typeof token === "function";
}
