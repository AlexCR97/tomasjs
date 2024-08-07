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
import { isPlainEndpoint, PlainEndpoint } from "@/endpoint";
import { HttpMethod } from "@tomasjs/core/http";
import {
  isWebAppEndpointHandler,
  WebAppEndpoint,
  WebAppEndpointContext,
  WebAppEndpointHandler,
} from "./WebAppEndpoint";
import { isHttpMethod } from "@tomasjs/core/http/HttpMethod";
import {
  GuardFactoryFunction,
  GuardFunction,
  IGuard,
  IGuardFactory,
  isGuardFactoryFunction,
  isGuardFunction,
  isIGuard,
  isIGuardFactory,
} from "@/guard";
import {
  AuthenticationPolicyFunction,
  IAuthenticationPolicy,
  IAuthenticationPolicyFactory,
  isAuthenticationPolicyFunction,
  isIAuthenticationPolicy,
  isIAuthenticationPolicyFactory,
} from "@/auth";

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

type GuardType =
  | GuardFunction
  | IGuard
  | Constructor<IGuard>
  | GuardFactoryFunction
  | IGuardFactory
  | Constructor<IGuardFactory>;

type AuthenticationPolicyType =
  | AuthenticationPolicyFunction
  | IAuthenticationPolicy
  | Constructor<IAuthenticationPolicy>
  | IAuthenticationPolicyFactory
  | Constructor<IAuthenticationPolicyFactory>;

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

  useGuard(guard: GuardFunction): this;
  useGuard(guard: IGuard): this;
  useGuard(guard: GuardFunction | IGuard): this;
  useGuard(guard: GuardFactoryFunction): this;
  useGuard(guard: IGuardFactory): this;
  useGuard(guard: Constructor<IGuard>): this;
  useGuard(guard: Constructor<IGuardFactory>): this;

  useAuthentication(policy: AuthenticationPolicyFunction): this;
  useAuthentication(policy: IAuthenticationPolicy): this;
  useAuthentication(policy: AuthenticationPolicyFunction | IAuthenticationPolicy): this;
  useAuthentication(policy: IAuthenticationPolicyFactory): this;
  useAuthentication(policy: Constructor<IAuthenticationPolicy>): this;
  useAuthentication(policy: Constructor<IAuthenticationPolicyFactory>): this;

  // TODO Implement
  // useEndpoint(endpoint: WebAppEndpointBuilder): this;
  useEndpoint(endpoint: WebAppEndpoint): this;
  useEndpoint(method: HttpMethod, path: string, handler: WebAppEndpointHandler): this;

  // Endpoint shorthands
  get(path: string, handler: WebAppEndpointHandler): this;
  post(path: string, handler: WebAppEndpointHandler): this;
  put(path: string, handler: WebAppEndpointHandler): this;
  patch(path: string, handler: WebAppEndpointHandler): this;
  delete(path: string, handler: WebAppEndpointHandler): this;
  head(path: string, handler: WebAppEndpointHandler): this;
  options(path: string, handler: WebAppEndpointHandler): this;
}

export class WebAppPipelineBuilder implements IWebAppPipelineBuilder {
  private readonly middlewares: MiddlewareType[] = [];
  private readonly interceptors: InterceptorType[] = [];
  private readonly guards: GuardType[] = [];
  private readonly authenticationPolicies: AuthenticationPolicyType[] = [];
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

  useGuard(guard: GuardFunction): this;
  useGuard(guard: IGuard): this;
  useGuard(guard: GuardFunction | IGuard): this;
  useGuard(guard: GuardFactoryFunction): this;
  useGuard(guard: IGuardFactory): this;
  useGuard(guard: Constructor<IGuard>): this;
  useGuard(guard: Constructor<IGuardFactory>): this;
  useGuard(guard: any): this {
    this.guards.push(guard);

    if (isConstructor<IGuard | IGuardFactory>(guard)) {
      this.containerDelegates.push((c) => {
        c.add("singleton", guard);
      });
    }

    return this;
  }

  useAuthentication(policy: AuthenticationPolicyFunction): this;
  useAuthentication(policy: IAuthenticationPolicy): this;
  useAuthentication(policy: AuthenticationPolicyFunction | IAuthenticationPolicy): this;
  useAuthentication(policy: IAuthenticationPolicyFactory): this;
  useAuthentication(policy: Constructor<IAuthenticationPolicy>): this;
  useAuthentication(policy: Constructor<IAuthenticationPolicyFactory>): this;
  useAuthentication(policy: any): this {
    this.authenticationPolicies.push(policy);

    if (isConstructor<IAuthenticationPolicy | IAuthenticationPolicyFactory>(policy)) {
      this.containerDelegates.push((c) => c.add("singleton", policy));
    }

    return this;
  }

  useEndpoint(endpoint: WebAppEndpoint): this;
  useEndpoint(method: HttpMethod, path: string, handler: WebAppEndpointHandler): this;
  useEndpoint(...args: unknown[]): this {
    if (args.length === 1 && isPlainEndpoint(args[0])) {
      const endpoint: WebAppEndpoint = args[0];
      return this.useWebAppEndpoint(endpoint);
    }

    if (
      args.length === 3 &&
      isHttpMethod(args[0]) &&
      typeof args[1] === "string" &&
      isWebAppEndpointHandler(args[2])
    ) {
      const method: HttpMethod = args[0];
      const path: string = args[1];
      const handler: WebAppEndpointHandler = args[2];
      return this.useWebAppEndpoint({ method, path, handler });
    }

    throw new InvalidOperationError();
  }

  private useWebAppEndpoint(endpoint: WebAppEndpoint): this {
    this.endpoints.push(endpoint);
    return this;
  }

  get(path: string, handler: WebAppEndpointHandler): this {
    return this.useEndpoint("GET", path, handler);
  }

  post(path: string, handler: WebAppEndpointHandler): this {
    return this.useEndpoint("POST", path, handler);
  }

  put(path: string, handler: WebAppEndpointHandler): this {
    return this.useEndpoint("PUT", path, handler);
  }

  patch(path: string, handler: WebAppEndpointHandler): this {
    return this.useEndpoint("PATCH", path, handler);
  }

  delete(path: string, handler: WebAppEndpointHandler): this {
    return this.useEndpoint("DELETE", path, handler);
  }

  head(path: string, handler: WebAppEndpointHandler): this {
    return this.useEndpoint("HEAD", path, handler);
  }

  options(path: string, handler: WebAppEndpointHandler): this {
    return this.useEndpoint("OPTIONS", path, handler);
  }

  async build(container: IContainerBuilder): Promise<{
    middlewares: MiddlewareFunction[];
    interceptors: InterceptorFunction[];
    guards: GuardFunction[];
    authenticationPolicies: AuthenticationPolicyFunction[];
    endpoints: PlainEndpoint[];
  }> {
    this.containerDelegates.forEach((delegate) => delegate(container));
    const services = await container.buildServiceProvider();

    const middlewares = this.middlewares.map((x) => this.toMiddlewareFunction(x, services));
    const interceptors = this.interceptors.map((x) => this.toInterceptorFunction(x, services));
    const guards = this.guards.map((x) => this.toGuardFunction(x, services));
    const authenticationPolicies = this.authenticationPolicies.map((x) =>
      this.toAuthenticationPolicyFunction(x, services)
    );
    const endpoints = this.endpoints.map((x) => this.toPlainEndpoint(x, services));

    return {
      middlewares,
      interceptors,
      guards,
      authenticationPolicies,
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

  private toGuardFunction(guardType: GuardType, services: IServiceProvider): GuardFunction {
    if (isConstructor<IGuard | IGuardFactory>(guardType)) {
      return (req) => {
        const service = services.getOrThrow<IGuard | IGuardFactory>(guardType);
        const guard = this.toGuardFunction(service, services);
        return guard(req);
      };
    }

    if (isGuardFactoryFunction(guardType)) {
      const guard = guardType();
      return this.toGuardFunction(guard, services);
    }

    if (isGuardFunction(guardType)) {
      return (req) => {
        return guardType(req);
      };
    }

    if (isIGuard(guardType)) {
      return (req) => {
        return guardType.protect(req);
      };
    }

    if (isIGuardFactory(guardType)) {
      const guard = guardType.createGuard();
      return this.toGuardFunction(guard, services);
    }

    throw new InvalidOperationError();
  }

  private toAuthenticationPolicyFunction(
    policyType: AuthenticationPolicyType,
    services: IServiceProvider
  ): AuthenticationPolicyFunction {
    if (isConstructor<IAuthenticationPolicy | IAuthenticationPolicyFactory>(policyType)) {
      return (req) => {
        const service = services.getOrThrow<IAuthenticationPolicy | IAuthenticationPolicyFactory>(
          policyType
        );
        const policy = this.toAuthenticationPolicyFunction(service, services);
        return policy(req);
      };
    }

    if (isAuthenticationPolicyFunction(policyType)) {
      return (req) => {
        return policyType(req);
      };
    }

    if (isIAuthenticationPolicy(policyType)) {
      return (req) => {
        return policyType.authenticate(req);
      };
    }

    if (isIAuthenticationPolicyFactory(policyType)) {
      const guard = policyType.createAuthenticationPolicy();
      return this.toAuthenticationPolicyFunction(guard, services);
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
