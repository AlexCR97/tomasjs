import { ClassConstructor } from "@/reflection";
import { Scope } from "./Scope";
import { Token } from "./Token";

export interface Container {
  addClass<T>(
    constructor: ClassConstructor<T>,
    options?: { token?: Token<T>; scope?: Scope }
  ): Container;
  addInstance<T>(instance: T, token: Token<T>): Container;
  get<T>(token: Token<T>): T;
  getAll<T>(token: Token<T>): T[];
  has<T>(token: Token<T>): boolean;
  isClassConstructor<T>(token: Token<T>): token is ClassConstructor<T>;
  remove<T>(token: Token<T>): Container;
}
