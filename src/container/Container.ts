import { container } from "tsyringe";
import { ClassConstructor } from "./ClassConstructor";
import { IContainer } from "./IContainer";
import { Token } from "./Token";

export class Container implements IContainer {
  private readonly _container = container.createChildContainer();

  addClass<T>(constructor: ClassConstructor<T>, token?: Token<T>): IContainer {
    const injectionToken = token ?? constructor;
    this._container.register(injectionToken, { useClass: constructor });
    return this;
  }

  addInstance<T>(instance: T, token: Token<T>): IContainer {
    this._container.register(token, { useValue: instance });
    return this;
  }

  get<T>(token: Token<T>): T {
    return this._container.resolve(token);
  }

  isClassConstructor<T>(token: Token<T>): token is ClassConstructor<T> {
    // TODO Improve type check?
    return typeof token === "function";
  }
}
