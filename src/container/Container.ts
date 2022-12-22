import { Container as InversifyContainer } from "inversify";
import { ClassConstructor } from "./ClassConstructor";
import { IContainer } from "./IContainer";
import { Scope } from "./Scope";
import { Token } from "./Token";

export class Container implements IContainer {
  private readonly _container = new InversifyContainer();

  addClass<T>(
    constructor: ClassConstructor<T>,
    options?: { token?: Token<T>; scope?: Scope }
  ): IContainer {
    const injectionToken = options?.token ?? constructor;

    if (options?.scope === "request") {
      this._container.bind<T>(injectionToken).to(constructor).inRequestScope();
    } else if (options?.scope === "singleton") {
      this._container.bind<T>(injectionToken).to(constructor).inSingletonScope();
    } else if (options?.scope === "transient" || options?.scope === undefined) {
      this._container.bind<T>(injectionToken).to(constructor).inTransientScope();
    } else {
      throw new Error(`Unsupported scope "${options?.scope}"`);
    }

    return this;
  }

  addInstance<T>(instance: T, token: Token<T>): IContainer {
    this._container.bind<T>(token).toConstantValue(instance);
    return this;
  }

  get<T>(token: Token<T>): T {
    return this._container.get<T>(token);
  }

  isClassConstructor<T>(token: Token<T>): token is ClassConstructor<T> {
    // TODO Improve type check?
    return typeof token === "function";
  }
}
