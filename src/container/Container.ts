import { Container as InversifyContainer } from "inversify";
import { ClassConstructor } from "./ClassConstructor";
import { IContainer } from "./IContainer";
import { Token } from "./Token";
import { TokenAdapter } from "./TokenAdapter";

export class Container implements IContainer {
  private readonly _container = new InversifyContainer();

  addClass<T>(constructor: ClassConstructor<T>, token?: Token<T>): IContainer {
    const injectionToken = token ?? constructor;
    // console.log("addClass injectionToken", injectionToken);
    const injectionTokenStr = TokenAdapter.toString(injectionToken);
    // console.log("addClass injectionTokenStr", injectionTokenStr);
    this._container.bind<T>(injectionTokenStr).to(constructor);
    return this;
  }

  addInstance<T>(instance: T, token: Token<T>): IContainer {
    // console.log("addInstance token", token);
    const tokenStr = TokenAdapter.toString(token);
    // console.log("addInstance tokenStr", tokenStr);
    this._container.bind<T>(tokenStr).toConstantValue(instance);
    return this;
  }

  get<T>(token: Token<T>): T {
    // console.log("get token", token);
    const tokenStr = TokenAdapter.toString(token);
    // console.log("get tokenStr", tokenStr);
    return this._container.get<T>(tokenStr);
  }

  isClassConstructor<T>(token: Token<T>): token is ClassConstructor<T> {
    // TODO Improve type check?
    return typeof token === "function";
  }
}
