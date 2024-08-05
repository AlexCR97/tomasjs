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
import { InterceptorFunction } from "@/interceptor";
import {
  IInterceptor,
  IInterceptorFactory,
  InterceptorFactoryFunction,
  isIInterceptor,
  isIInterceptorFactory,
  isInterceptorFactoryFunction,
  isInterceptorFunction,
} from "@/interceptor/Interceptor";
import { Endpoint, EndpointHandler, EndpointOptions, PlainEndpoint } from "@/endpoint";
import { HttpMethod } from "@tomasjs/core/http";
import { WebAppEndpoint, WebAppEndpointContext } from "./WebAppEndpoint";

export type WebAppPipelineBuilderDelegate = (builder: IWebAppPipelineBuilder) => void;

type MiddlewareType =
  | MiddlewareFunction
  | IMiddleware
  | Constructor<IMiddleware>
  | MiddlewareFactoryFunction
  | IMiddlewareFactory
  | Constructor<IMiddlewareFactory>;

type InterceptorType =
  | InterceptorFunction
  | IInterceptor
  | Constructor<IInterceptor>
  | InterceptorFactoryFunction
  | IInterceptorFactory
  | Constructor<IInterceptorFactory>;

export interface IWebAppPipelineBuilder {
  delegate(delegate: WebAppPipelineBuilderDelegate): this;

  use(middleware: MiddlewareFunction): this;
  use(middleware: IMiddleware): this;
  use(middleware: MiddlewareFunction | IMiddleware): this;
  use(middleware: MiddlewareFactoryFunction): this;
  use(middleware: IMiddlewareFactory): this;
  use(middleware: Constructor<IMiddleware>): this;
  use(middleware: Constructor<IMiddlewareFactory>): this;

  useInterceptor(interceptor: InterceptorFunction): this;
  useInterceptor(interceptor: IInterceptor): this;
  useInterceptor(interceptor: InterceptorFunction | IInterceptor): this;
  useInterceptor(interceptor: InterceptorFactoryFunction): this;
  useInterceptor(interceptor: IInterceptorFactory): this;
  useInterceptor(interceptor: Constructor<IInterceptor>): this;
  useInterceptor(interceptor: Constructor<IInterceptorFactory>): this;

  // useEndpoint(endpoint: Endpoint): this;
  useEndpoint(endpoint: WebAppEndpoint): this;
  // useEndpoint(
  //   method: HttpMethod,
  //   path: string,
  //   handler: EndpointHandler,
  //   options?: EndpointOptions
  // ): this;

  // Endpoint shorthands
  // get(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  // post(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  // put(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  // patch(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  // delete(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  // head(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  // options(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
}

export class WebAppPipelineBuilder implements IWebAppPipelineBuilder {
  private readonly middlewares: MiddlewareType[] = [];
  private readonly interceptors: InterceptorType[] = [];
  private readonly endpoints: WebAppEndpoint[] = [];
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

  useInterceptor(interceptor: InterceptorFunction): this;
  useInterceptor(interceptor: IInterceptor): this;
  useInterceptor(interceptor: InterceptorFunction | IInterceptor): this;
  useInterceptor(interceptor: InterceptorFactoryFunction): this;
  useInterceptor(interceptor: IInterceptorFactory): this;
  useInterceptor(interceptor: Constructor<IInterceptor>): this;
  useInterceptor(interceptor: Constructor<IInterceptorFactory>): this;
  useInterceptor(interceptor: any): this {
    this.interceptors.push(interceptor);

    if (isConstructor<IInterceptor | IInterceptorFactory>(interceptor)) {
      this.containerDelegates.push((c) => {
        c.add("singleton", interceptor);
      });
    }

    return this;
  }

  useEndpoint(endpoint: WebAppEndpoint): this {
    this.endpoints.push(endpoint);
    return this;
  }

  async build(container: IContainerBuilder): Promise<{
    middlewares: MiddlewareFunction[];
    interceptors: InterceptorFunction[];
    endpoints: PlainEndpoint[];
  }> {
    this.containerDelegates.forEach((delegate) => delegate(container));
    const services = await container.buildServiceProvider();

    const middlewares = this.middlewares.map((x) => this.toMiddlewareFunction(x, services));
    const interceptors = this.interceptors.map((x) => this.toInterceptorFunction(x, services));
    const endpoints = this.endpoints.map((x) => this.toPlainEndpoint(x, services));

    return {
      middlewares,
      interceptors,
      endpoints,
    };
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

  private toInterceptorFunction(
    interceptorType: InterceptorType,
    services: IServiceProvider
  ): InterceptorFunction {
    if (isConstructor<IInterceptor | IInterceptorFactory>(interceptorType)) {
      return (req) => {
        const service = services.getOrThrow<IInterceptor | IInterceptorFactory>(interceptorType);
        const interceptor = this.toInterceptorFunction(service, services);
        return interceptor(req);
      };
    }

    if (isInterceptorFactoryFunction(interceptorType)) {
      const interceptor = interceptorType();
      return this.toInterceptorFunction(interceptor, services);
    }

    if (isInterceptorFunction(interceptorType)) {
      return (req) => {
        return interceptorType(req);
      };
    }

    if (isIInterceptor(interceptorType)) {
      return (req) => {
        return interceptorType.intercept(req);
      };
    }

    if (isIInterceptorFactory(interceptorType)) {
      const interceptor = interceptorType.createInterceptor();
      return this.toInterceptorFunction(interceptor, services);
    }

    throw new InvalidOperationError();
  }

  private toPlainEndpoint(endpoint: WebAppEndpoint, services: IServiceProvider): PlainEndpoint {
    return {
      method: endpoint.method,
      path: endpoint.path,
      handler: async (context) => {
        const newContext = WebAppEndpointContext.from(context, services);
        return await endpoint.handler(newContext);
      },
      options: undefined, // TODO Map options
    };
  }
}
