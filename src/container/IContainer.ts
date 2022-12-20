import { ClassConstructor } from "./ClassConstructor";
import { Token } from "./Token";

export interface IContainer {
  addClass<T>(constructor: ClassConstructor<T>, token?: Token<T>): IContainer;
  addInstance<T>(instance: T, token: Token<T>): IContainer;
  get<T>(token: Token<T>): T;
  isClassConstructor<T>(token: Token<T>): token is ClassConstructor<T>;
}
