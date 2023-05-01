import {
  ClassConstructor,
  Container,
  NotImplementedError,
  isClassConstructor,
} from "@tomasjs/core";
import { Middleware } from "./Middleware";
import { MiddlewareFactory } from "./MiddlewareFactory";
import { isMiddlewareFactoryHandler, MiddlewareFactoryHandler } from "./MiddlewareFactoryHandler";
import { MiddlewareHandler } from "./MiddlewareHandler";

/**
 * Resolves a `MiddlewareFactory` into a `Middleware`.
 *
 * Considering that:
 * `TMiddleware extends Middleware = Middleware`
 *
 * Then, a valid `MiddlewareFactory` could be:
 * - An arrow function of type `MiddlewareFactoryHandler<TMiddleware>`
 * - An instance of a `MiddlewareFactory<TMiddleware>`
 * - A constructor of a `MiddlewareFactory<TMiddleware>`
 */
export abstract class MiddlewareFactoryAdapter {
  private constructor() {}

  private static get container(): Container {
    throw new NotImplementedError("get container"); // TODO Implement
  }

  static isFactory<TMiddleware extends Middleware = Middleware>(
    obj: any
  ): obj is
    | MiddlewareFactoryHandler<TMiddleware>
    | MiddlewareFactory<TMiddleware>
    | ClassConstructor<MiddlewareFactory<TMiddleware>> {
    return (
      isMiddlewareFactoryHandler(obj) ||
      obj instanceof MiddlewareFactory<TMiddleware> ||
      isClassConstructor(obj)
    );
  }

  static from<TMiddleware extends Middleware = Middleware>(
    factory:
      | MiddlewareFactoryHandler<TMiddleware>
      | MiddlewareFactory<TMiddleware>
      | ClassConstructor<MiddlewareFactory<TMiddleware>>
  ) {
    if (isMiddlewareFactoryHandler(factory)) {
      return this.fromType(factory);
    } else if (factory instanceof MiddlewareFactory<TMiddleware>) {
      return this.fromInstance(factory);
    } else {
      return this.fromConstructor(factory);
    }
  }

  static fromType<TMiddleware extends Middleware = Middleware>(
    factory: MiddlewareFactoryHandler<TMiddleware>
  ) {
    return factory();
  }

  static fromInstance<TMiddleware extends Middleware = Middleware>(
    factory: MiddlewareFactory<TMiddleware>
  ): MiddlewareHandler | TMiddleware | ClassConstructor<TMiddleware> {
    return factory.create();
  }

  static fromConstructor<TMiddleware extends Middleware = Middleware>(
    factory: ClassConstructor<MiddlewareFactory<TMiddleware>>
  ): MiddlewareHandler | TMiddleware | ClassConstructor<TMiddleware> {
    const factoryInstance = this.container.get(factory);
    return factoryInstance.create();
  }
}
