import { ClassConstructor, Container, isClassConstructor } from "@tomasjs/core";
import { Middleware } from "./Middleware";
import { MiddlewareFactory } from "./MiddlewareFactory";
import { isMiddlewareFactoryHandler, MiddlewareFactoryHandler } from "./MiddlewareFactoryHandler";
import { MiddlewareHandler } from "./MiddlewareHandler";
import { Logger } from "@tomasjs/logging";

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
export class MiddlewareFactoryAdapter<TMiddleware extends Middleware = Middleware> {
  constructor(
    private readonly options: {
      container: Container;
      factory:
        | MiddlewareFactoryHandler<TMiddleware>
        | MiddlewareFactory<TMiddleware>
        | ClassConstructor<MiddlewareFactory<TMiddleware>>;
      logger?: Logger;
    }
  ) {}

  private get container(): Container {
    return this.options.container;
  }

  private get factory() {
    return this.options.factory;
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

  adapt() {
    if (isMiddlewareFactoryHandler(this.factory)) {
      return this.fromType(this.factory);
    } else if (this.factory instanceof MiddlewareFactory<TMiddleware>) {
      return this.fromInstance(this.factory);
    } else {
      return this.fromConstructor(this.factory);
    }
  }

  private fromType<TMiddleware extends Middleware = Middleware>(
    factory: MiddlewareFactoryHandler<TMiddleware>
  ) {
    return factory();
  }

  private fromInstance<TMiddleware extends Middleware = Middleware>(
    factory: MiddlewareFactory<TMiddleware>
  ): MiddlewareHandler | TMiddleware | ClassConstructor<TMiddleware> {
    return factory.create();
  }

  private fromConstructor<TMiddleware extends Middleware = Middleware>(
    factory: ClassConstructor<MiddlewareFactory<TMiddleware>>
  ): MiddlewareHandler | TMiddleware | ClassConstructor<TMiddleware> {
    const factoryInstance = this.container.get(factory);
    return factoryInstance.create();
  }
}
