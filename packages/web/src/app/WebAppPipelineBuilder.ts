import {
  ContainerBuilderDelegate,
  IContainerBuilder,
  IServiceProvider,
} from "@tomasjs/core/dependency-injection";
import { InvalidOperationError } from "@tomasjs/core/errors";
import { Constructor, isConstructor } from "@tomasjs/core/system";
import {
  IMiddleware,
  IMiddlewareFactory,
  isIMiddleware,
  isIMiddlewareFactory,
  isMiddlewareFactoryFunction,
  isMiddlewareFunction,
  MiddlewareAggregate,
  MiddlewareFactoryFunction,
  MiddlewareFunction,
} from "@/middleware";

export type WebAppPipelineBuilderDelegate = (builder: IWebAppPipelineBuilder) => void;

export interface IWebAppPipelineBuilder {
  delegate(delegate: WebAppPipelineBuilderDelegate): this;

  use(middleware: MiddlewareFunction): this;
  use(middleware: IMiddleware): this;
  use(middleware: MiddlewareFunction | IMiddleware): this;
  use(middleware: MiddlewareFactoryFunction): this;
  use(middleware: IMiddlewareFactory): this;
  use(middleware: Constructor<IMiddleware>): this;
  use(middleware: Constructor<IMiddlewareFactory>): this;
}

export class WebAppPipelineBuilder implements IWebAppPipelineBuilder {
  private readonly middlewares: MiddlewareType[] = [];
  private readonly containerDelegates: ContainerBuilderDelegate[] = [];

  delegate(delegate: WebAppPipelineBuilderDelegate): this {
    delegate(this);
    return this;
  }

  use(middleware: MiddlewareFunction): this;
  use(middleware: IMiddleware): this;
  use(middleware: MiddlewareFunction | IMiddleware): this;
  use(middleware: MiddlewareFactoryFunction): this;
  use(middleware: IMiddlewareFactory): this;
  use(middleware: Constructor<IMiddleware>): this;
  use(middleware: Constructor<IMiddlewareFactory>): this;
  use(middleware: any): this {
    this.middlewares.push(middleware);

    if (isConstructor<IMiddleware | IMiddlewareFactory>(middleware)) {
      this.containerDelegates.push((c) => {
        c.add("singleton", middleware);
      });
    }

    return this;
  }

  async build(container: IContainerBuilder): Promise<MiddlewareFunction[]> {
    this.containerDelegates.forEach((delegate) => delegate(container));
    const services = await container.buildServiceProvider();

    const middlewareFunctions = this.middlewares.map((x) => this.toMiddlewareFunction(x, services));

    return new MiddlewareAggregate().addMiddleware(...middlewareFunctions).get();
  }

  private toMiddlewareFunction(
    middlewareType: MiddlewareType,
    services: IServiceProvider
  ): MiddlewareFunction {
    if (isConstructor<IMiddleware | IMiddlewareFactory>(middlewareType)) {
      return (req, res, next) => {
        const service = services.getOrThrow<IMiddleware | IMiddlewareFactory>(middlewareType);
        const middleware = this.toMiddlewareFunction(service, services);
        return middleware(req, res, next);
      };
    }

    if (isMiddlewareFactoryFunction(middlewareType)) {
      const middleware = middlewareType();
      return this.toMiddlewareFunction(middleware, services);
    }

    if (isMiddlewareFunction(middlewareType)) {
      return (req, res, next) => {
        return middlewareType(req, res, next);
      };
    }

    if (isIMiddleware(middlewareType)) {
      return (req, res, next) => {
        return middlewareType.run(req, res, next);
      };
    }

    if (isIMiddlewareFactory(middlewareType)) {
      const middleware = middlewareType.createMiddleware();
      return this.toMiddlewareFunction(middleware, services);
    }

    throw new InvalidOperationError();
  }
}

type MiddlewareType =
  | MiddlewareFunction
  | IMiddleware
  | Constructor<IMiddleware>
  | MiddlewareFactoryFunction
  | IMiddlewareFactory
  | Constructor<IMiddlewareFactory>;
