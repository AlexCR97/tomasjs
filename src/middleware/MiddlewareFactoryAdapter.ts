import { isConstructorToken } from "@/core/tsyringe";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
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

  static isFactory<TMiddleware extends Middleware = Middleware>(
    obj: any
  ): obj is
    | MiddlewareFactoryHandler<TMiddleware>
    | MiddlewareFactory<TMiddleware>
    | constructor<MiddlewareFactory<TMiddleware>> {
    return (
      isMiddlewareFactoryHandler(obj) ||
      obj instanceof MiddlewareFactory<TMiddleware> ||
      isConstructorToken(obj)
    );
  }

  static from<TMiddleware extends Middleware = Middleware>(
    factory:
      | MiddlewareFactoryHandler<TMiddleware>
      | MiddlewareFactory<TMiddleware>
      | constructor<MiddlewareFactory<TMiddleware>>
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
  ): MiddlewareHandler | TMiddleware | constructor<TMiddleware> {
    return factory.create();
  }

  static fromConstructor<TMiddleware extends Middleware = Middleware>(
    factory: constructor<MiddlewareFactory<TMiddleware>>
  ): MiddlewareHandler | TMiddleware | constructor<TMiddleware> {
    const factoryInstance = container.resolve(factory);
    return factoryInstance.create();
  }
}
