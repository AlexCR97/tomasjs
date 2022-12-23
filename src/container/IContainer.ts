import { ClassConstructor } from "./ClassConstructor";
import { Scope } from "./Scope";
import { Token } from "./Token";

export interface IContainer {
  addClass<T>(
    constructor: ClassConstructor<T>,
    options?: { token?: Token<T>; scope?: Scope }
  ): IContainer;
  addInstance<T>(instance: T, token: Token<T>): IContainer;
  get<T>(token: Token<T>): T;
  isClassConstructor<T>(token: Token<T>): token is ClassConstructor<T>;
  remove<T>(token: Token<T>): IContainer;
}
