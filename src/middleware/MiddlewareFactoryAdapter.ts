import { isConstructorToken } from "@/core/tsyringe";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ThomasMiddleware } from "./Middleware";
import { MiddlewareFactory } from "./MiddlewareFactory";
import { isMiddlewareFactoryHandler, MiddlewareFactoryHandler } from "./MiddlewareFactoryHandler";
import { ThomasMiddlewareHandler } from "./types";

/**
 * Resolves a `MiddlewareFactory` into a `Middleware`.
 *
 * Considering that:
 * `TMiddleware extends ThomasMiddleware = ThomasMiddleware`
 *
 * Then, a valid `MiddlewareFactory` could be:
 * - An arrow function of type `MiddlewareFactoryHandler<TMiddleware>`
 * - An instance of a `MiddlewareFactory<TMiddleware>`
 * - A constructor of a `MiddlewareFactory<TMiddleware>`
 */
export class MiddlewareFactoryAdapter {
  private constructor() {}

  static isFactory<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
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

  static from<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
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

  static fromType<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
    factory: MiddlewareFactoryHandler<TMiddleware>
  ) {
    return factory();
  }

  static fromInstance<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
    factory: MiddlewareFactory<TMiddleware>
  ): ThomasMiddlewareHandler | TMiddleware | constructor<TMiddleware> {
    return factory.create();
  }

  static fromConstructor<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
    factory: constructor<MiddlewareFactory<TMiddleware>>
  ): ThomasMiddlewareHandler | TMiddleware | constructor<TMiddleware> {
    const factoryInstance = container.resolve(factory);
    return factoryInstance.create();
  }
}
