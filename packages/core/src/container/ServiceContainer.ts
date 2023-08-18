import { Container as InversifyContainer } from "inversify";
import { ClassConstructor } from "@/reflection";
import { Container } from "./Container";
import { Scope } from "./Scope";
import { Token } from "./Token";
import { UnknownTokenError } from "./UnknownTokenError";
import { RemoveTokenError } from "./RemoveTokenError";

export class ServiceContainer implements Container {
  private _container = new InversifyContainer({
    /**
     * The following statement prevents the error "Missing required @injectable annotation in: SomeClass".
     *
     * This error occurs when applying a decorator to a class that extends another class (inheritance).
     *
     * More information at:
     * https://github.com/inversify/InversifyJS/blob/master/wiki/inheritance.md
     */
    skipBaseClassChecks: true,
  });

  addClass<T>(
    constructor: ClassConstructor<T>,
    options?: { token?: Token<T>; scope?: Scope }
  ): Container {
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

  addInstance<T>(instance: T, token: Token<T>): Container {
    this._container.bind<T>(token).toConstantValue(instance);
    return this;
  }

  get<T>(token: Token<T>): T {
    try {
      return this._container.get<T>(token);
    } catch (err) {
      throw new UnknownTokenError(token, err);
    }
  }

  getOrDefault<T>(token: Token<T>): T | undefined {
    try {
      return this._container.get<T>(token);
    } catch (err) {
      // TODO Check error
      return undefined;
    }
  }

  getAll<T>(token: Token<T>): T[] {
    try {
      return this._container.getAll<T>(token);
    } catch (err) {
      // TODO Check error type
      return [];
    }
  }

  has<T>(token: Token<T>): boolean {
    const service = this.getOrDefault<T>(token);
    return service !== undefined;
  }

  remove<T>(token: Token<T>): Container {
    try {
      this._container.unbind(token);
      return this;
    } catch (err) {
      throw new RemoveTokenError(token, err);
    }
  }
}
