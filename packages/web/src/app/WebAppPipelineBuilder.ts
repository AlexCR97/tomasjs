import { InvalidOperationError } from "@tomasjs/core/errors";
import { HttpMethod } from "@tomasjs/core/http";
import { isHttpMethod } from "@tomasjs/core/http/HttpMethod";
import { Constructor, isConstructor } from "@tomasjs/core/system";
import {
  ContainerBuilderDelegate,
  IContainerBuilder,
  IServiceProvider,
} from "@tomasjs/core/dependency-injection";
import {
  EndpointOptions as ServerEndpointOptions,
  PlainEndpoint as ServerPlainEndpoint,
} from "@/endpoint";
import {
  Endpoint,
  EndpointOptions,
  isEndpoint,
  isPlainEndpoint,
  isEndpointHandler,
  PlainEndpoint,
  EndpointContext,
  EndpointHandler,
} from "./Endpoint";
import {
  AuthenticationPolicyFunction as ServerAuthenticationPolicyFunction,
  AuthorizationPolicyFunction as ServerAuthorizationPolicyFunction,
} from "@/auth";
import {
  IMiddleware,
  IMiddlewareFactory,
  isIMiddleware,
  isIMiddlewareFactory,
  isMiddlewareFunction,
  MiddlewareFunction,
  MiddlewareType,
} from "./Middleware";
import { RequestContext, RequestContextReader } from "./RequestContext";
import { MiddlewareFunction as ServerMiddlewareFunction } from "@/middleware";
import {
  ErrorHandlerFunction,
  ErrorHandlerType,
  IErrorHandler,
  IErrorHandlerFactory,
  isErrorHandlerFunction,
  isIErrorHandler,
  isIErrorHandlerFactory,
} from "./ErrorHandler";
import { ErrorHandlerFunction as ServerErrorHandlerFunction } from "@/error-handler";
import { InterceptorFunction as ServerInterceptorFunction } from "@/interceptor";
import {
  IInterceptor,
  IInterceptorFactory,
  InterceptorFunction,
  InterceptorType,
  isIInterceptor,
  isIInterceptorFactory,
  isInterceptorFunction,
} from "./Interceptor";
import { GuardFunction as ServerGuardFunction } from "@/guard";
import {
  GuardFunction,
  GuardType,
  IGuard,
  IGuardFactory,
  isGuardFunction,
  isIGuard,
  isIGuardFactory,
} from "./Guard";
import {
  AuthenticationPolicyFunction,
  AuthenticationPolicyType,
  IAuthenticationPolicy,
  IAuthenticationPolicyFactory,
  isAuthenticationPolicyFunction,
  isIAuthenticationPolicy,
  isIAuthenticationPolicyFactory,
} from "./Authentication";
import {
  AuthorizationPolicyFunction,
  AuthorizationPolicyType,
  IAuthorizationPolicy,
  IAuthorizationPolicyFactory,
  isAuthorizationPolicyFunction,
  isIAuthorizationPolicy,
  isIAuthorizationPolicyFactory,
} from "./Authorization";
import { isInRange } from "@/common";

export type WebAppPipelineBuilderDelegate = (builder: IWebAppPipelineBuilder) => void;

export interface IWebAppPipelineBuilder {
  delegate(delegate: WebAppPipelineBuilderDelegate): this;

  use(middleware: MiddlewareFunction): this;
  use(middleware: IMiddleware): this;
  use(middleware: MiddlewareFunction | IMiddleware): this;
  use(middleware: IMiddlewareFactory): this;
  use(middleware: Constructor<IMiddleware>): this;
  use(middleware: Constructor<IMiddlewareFactory>): this;

  useInterceptor(interceptor: InterceptorFunction): this;
  useInterceptor(interceptor: IInterceptor): this;
  useInterceptor(interceptor: InterceptorFunction | IInterceptor): this;
  useInterceptor(interceptor: IInterceptorFactory): this;
  useInterceptor(interceptor: Constructor<IInterceptor>): this;
  useInterceptor(interceptor: Constructor<IInterceptorFactory>): this;

  useGuard(guard: GuardFunction): this;
  useGuard(guard: IGuard): this;
  useGuard(guard: GuardFunction | IGuard): this;
  useGuard(guard: IGuardFactory): this;
  useGuard(guard: Constructor<IGuard>): this;
  useGuard(guard: Constructor<IGuardFactory>): this;

  useAuthentication(policy: AuthenticationPolicyFunction): this;
  useAuthentication(policy: IAuthenticationPolicy): this;
  useAuthentication(policy: AuthenticationPolicyFunction | IAuthenticationPolicy): this;
  useAuthentication(policy: IAuthenticationPolicyFactory): this;
  useAuthentication(policy: Constructor<IAuthenticationPolicy>): this;
  useAuthentication(policy: Constructor<IAuthenticationPolicyFactory>): this;

  useAuthorization(policy: AuthorizationPolicyFunction): this;
  useAuthorization(policy: IAuthorizationPolicy): this;
  useAuthorization(policy: AuthorizationPolicyFunction | IAuthenticationPolicy): this;
  useAuthorization(policy: IAuthorizationPolicyFactory): this;
  useAuthorization(policy: Constructor<IAuthorizationPolicy>): this;
  useAuthorization(policy: Constructor<IAuthorizationPolicyFactory>): this;

  useEndpoint(endpoint: PlainEndpoint): this;
  useEndpoint(endpoint: Endpoint): this;
  useEndpoint(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler,
    options?: EndpointOptions
  ): this;

  get(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  post(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  put(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  patch(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  delete(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  head(path: string, handler: EndpointHandler, options?: EndpointOptions): this;
  options(path: string, handler: EndpointHandler, options?: EndpointOptions): this;

  useErrorHandler(errorHandler: ErrorHandlerFunction): this;
  useErrorHandler(errorHandler: IErrorHandler): this;
  useErrorHandler(errorHandler: ErrorHandlerFunction | IErrorHandler): this;
  useErrorHandler(errorHandler: IErrorHandlerFactory): this;
  useErrorHandler(errorHandler: Constructor<IErrorHandler>): this;
  useErrorHandler(errorHandler: Constructor<IErrorHandlerFactory>): this;
}

export class WebAppPipelineBuilder implements IWebAppPipelineBuilder {
  private readonly containerDelegates: ContainerBuilderDelegate[] = [];
  private readonly middlewares: MiddlewareType[] = [];
  private readonly interceptors: InterceptorType[] = [];
  private readonly guards: GuardType[] = [];
  private readonly authenticationPolicies: AuthenticationPolicyType[] = [];
  private readonly authorizationPolicies: AuthorizationPolicyType[] = [];
  private readonly endpoints: PlainEndpoint[] = [];
  private errorHandler: ErrorHandlerType | undefined;

  delegate(delegate: WebAppPipelineBuilderDelegate): this {
    delegate(this);
    return this;
  }

  use(middleware: MiddlewareFunction): this;
  use(middleware: IMiddleware): this;
  use(middleware: MiddlewareFunction | IMiddleware): this;
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

  useAuthorization(policy: AuthorizationPolicyFunction): this;
  useAuthorization(policy: IAuthorizationPolicy): this;
  useAuthorization(policy: AuthorizationPolicyFunction | IAuthenticationPolicy): this;
  useAuthorization(policy: IAuthorizationPolicyFactory): this;
  useAuthorization(policy: Constructor<IAuthorizationPolicy>): this;
  useAuthorization(policy: Constructor<IAuthorizationPolicyFactory>): this;
  useAuthorization(policy: any): this {
    this.authorizationPolicies.push(policy);

    if (isConstructor<IAuthorizationPolicy | IAuthorizationPolicyFactory>(policy)) {
      this.containerDelegates.push((c) => c.add("singleton", policy));
    }

    return this;
  }

  useEndpoint(endpoint: PlainEndpoint): this;
  useEndpoint(endpoint: Endpoint): this;
  useEndpoint(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler,
    options?: EndpointOptions
  ): this;
  useEndpoint(...args: unknown[]): this {
    if (args.length === 1) {
      if (isEndpoint(args[0])) {
        const endpoint: Endpoint = args[0];
        return this.useWebAppEndpoint(endpoint.toPlain());
      }

      if (isPlainEndpoint(args[0])) {
        const endpoint: PlainEndpoint = args[0];
        return this.useWebAppEndpoint(endpoint);
      }
    }

    if (
      isInRange(args.length, 3, 4) &&
      isHttpMethod(args[0]) &&
      typeof args[1] === "string" &&
      isEndpointHandler(args[2])
    ) {
      const method: HttpMethod = args[0];
      const path: string = args[1];
      const handler: EndpointHandler = args[2];
      const options: EndpointOptions = args[3] as EndpointOptions;
      return this.useWebAppEndpoint({ method, path, handler, options });
    }

    throw new TypeError(`Unknown endpoint type: ${args}`);
  }

  private useWebAppEndpoint(endpoint: PlainEndpoint): this {
    this.endpoints.push(endpoint);
    return this;
  }

  get(path: string, handler: EndpointHandler, options?: EndpointOptions): this {
    return this.useEndpoint("GET", path, handler, options);
  }

  post(path: string, handler: EndpointHandler, options?: EndpointOptions): this {
    return this.useEndpoint("POST", path, handler, options);
  }

  put(path: string, handler: EndpointHandler, options?: EndpointOptions): this {
    return this.useEndpoint("PUT", path, handler, options);
  }

  patch(path: string, handler: EndpointHandler, options?: EndpointOptions): this {
    return this.useEndpoint("PATCH", path, handler, options);
  }

  delete(path: string, handler: EndpointHandler, options?: EndpointOptions): this {
    return this.useEndpoint("DELETE", path, handler, options);
  }

  head(path: string, handler: EndpointHandler, options?: EndpointOptions): this {
    return this.useEndpoint("HEAD", path, handler, options);
  }

  options(path: string, handler: EndpointHandler, options?: EndpointOptions): this {
    return this.useEndpoint("OPTIONS", path, handler, options);
  }

  useErrorHandler(errorHandler: ErrorHandlerFunction): this;
  useErrorHandler(errorHandler: IErrorHandler): this;
  useErrorHandler(errorHandler: ErrorHandlerFunction | IErrorHandler): this;
  useErrorHandler(errorHandler: IErrorHandlerFactory): this;
  useErrorHandler(errorHandler: Constructor<IErrorHandler>): this;
  useErrorHandler(errorHandler: Constructor<IErrorHandlerFactory>): this;
  useErrorHandler(errorHandler: any): this {
    this.errorHandler = errorHandler;

    if (isConstructor<IErrorHandler | IErrorHandlerFactory>(errorHandler)) {
      this.containerDelegates.push((c) => c.add("singleton", errorHandler));
    }

    return this;
  }

  async build(container: IContainerBuilder): Promise<{
    middlewares: ServerMiddlewareFunction[];
    interceptors: ServerInterceptorFunction[];
    guards: ServerGuardFunction[];
    authenticationPolicies: ServerAuthenticationPolicyFunction[];
    authorizationPolicies: ServerAuthorizationPolicyFunction[];
    endpoints: ServerPlainEndpoint[];
    errorHandler: ServerErrorHandlerFunction | null;
  }> {
    this.containerDelegates.forEach((delegate) => delegate(container));
    const services = await container.buildServiceProvider();

    const middlewares = this.middlewares.map((x) => this.toMiddlewareFunction(x, services));

    const interceptors = this.interceptors.map((x) => this.toInterceptorFunction(x, services));

    const guards = this.guards.map((x) => this.toGuardFunction(x, services));

    const authenticationPolicies = this.authenticationPolicies.map((x) =>
      this.toAuthenticationPolicyFunction(x, services)
    );

    const authorizationPolicies = this.authorizationPolicies.map((x) =>
      this.toAuthorizationPolicyFunction(x, services)
    );

    const endpoints = this.endpoints.map((x) => this.toPlainEndpoint(x, services));

    const errorHandler =
      this.errorHandler !== undefined && this.errorHandler !== null
        ? this.toErrorHandlerFunction(this.errorHandler, services)
        : null;

    return {
      middlewares,
      interceptors,
      guards,
      authenticationPolicies,
      authorizationPolicies,
      endpoints,
      errorHandler,
    };
  }

  private toMiddlewareFunction(
    middlewareType: MiddlewareType,
    services: IServiceProvider
  ): ServerMiddlewareFunction {
    if (isConstructor<IMiddleware | IMiddlewareFactory>(middlewareType)) {
      return ({ req, res, next }) => {
        const service = services.getOrThrow<IMiddleware | IMiddlewareFactory>(middlewareType);
        const middleware = this.toMiddlewareFunction(service, services);
        return middleware({ req, res, next });
      };
    }

    if (isMiddlewareFunction(middlewareType)) {
      return ({ req, res, next }) => {
        const requestContext = RequestContext.from(req, services);
        return middlewareType({ req: requestContext, res, next, services });
      };
    }

    if (isIMiddleware(middlewareType)) {
      return ({ req, res, next }) => {
        const requestContext = RequestContext.from(req, services);
        return middlewareType.run({ req: requestContext, res, next, services });
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
  ): ServerInterceptorFunction {
    if (isConstructor<IInterceptor | IInterceptorFactory>(interceptorType)) {
      return (req) => {
        const service = services.getOrThrow<IInterceptor | IInterceptorFactory>(interceptorType);
        const interceptor = this.toInterceptorFunction(service, services);
        return interceptor(req);
      };
    }

    if (isInterceptorFunction(interceptorType)) {
      return ({ req }) => {
        const requestContext = RequestContext.from(req, services);
        return interceptorType({ req: requestContext });
      };
    }

    if (isIInterceptor(interceptorType)) {
      return ({ req }) => {
        const requestContext = RequestContext.from(req, services);
        return interceptorType.intercept({ req: requestContext });
      };
    }

    if (isIInterceptorFactory(interceptorType)) {
      const interceptor = interceptorType.createInterceptor();
      return this.toInterceptorFunction(interceptor, services);
    }

    throw new TypeError(`Unknown interceptor type: ${interceptorType}`);
  }

  private toGuardFunction(guardType: GuardType, services: IServiceProvider): ServerGuardFunction {
    if (isConstructor<IGuard | IGuardFactory>(guardType)) {
      return (req) => {
        const service = services.getOrThrow<IGuard | IGuardFactory>(guardType);
        const guard = this.toGuardFunction(service, services);
        return guard(req);
      };
    }

    if (isGuardFunction(guardType)) {
      return ({ req }) => {
        const requestContext = RequestContext.from(req, services);
        return guardType({ req: requestContext });
      };
    }

    if (isIGuard(guardType)) {
      return ({ req }) => {
        const requestContext = RequestContext.from(req, services);
        return guardType.protect({ req: requestContext });
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
  ): ServerAuthenticationPolicyFunction {
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
      return ({ req }) => {
        const requestContext = RequestContext.from(req, services);
        return policyType({ req: requestContext });
      };
    }

    if (isIAuthenticationPolicy(policyType)) {
      return ({ req }) => {
        const requestContext = RequestContext.from(req, services);
        return policyType.authenticate({ req: requestContext });
      };
    }

    if (isIAuthenticationPolicyFactory(policyType)) {
      const guard = policyType.createAuthenticationPolicy();
      return this.toAuthenticationPolicyFunction(guard, services);
    }

    throw new InvalidOperationError();
  }

  private toAuthorizationPolicyFunction(
    policyType: AuthorizationPolicyType,
    services: IServiceProvider
  ): ServerAuthorizationPolicyFunction {
    if (isConstructor<IAuthorizationPolicy | IAuthorizationPolicyFactory>(policyType)) {
      return (req) => {
        const service = services.getOrThrow<IAuthorizationPolicy | IAuthorizationPolicyFactory>(
          policyType
        );
        const policy = this.toAuthorizationPolicyFunction(service, services);
        return policy(req);
      };
    }

    if (isAuthorizationPolicyFunction(policyType)) {
      return ({ req }) => {
        const reqReader = RequestContextReader.from(req, services);
        return policyType({ req: reqReader });
      };
    }

    if (isIAuthorizationPolicy(policyType)) {
      return ({ req }) => {
        const reqReader = RequestContextReader.from(req, services);
        return policyType.authorize({ req: reqReader });
      };
    }

    if (isIAuthorizationPolicyFactory(policyType)) {
      const guard = policyType.createAuthorizationPolicy();
      return this.toAuthorizationPolicyFunction(guard, services);
    }

    throw new InvalidOperationError();
  }

  private toPlainEndpoint(
    endpoint: PlainEndpoint,
    services: IServiceProvider
  ): ServerPlainEndpoint {
    return {
      method: endpoint.method,
      path: endpoint.path,
      handler: async (context) => {
        const newContext = EndpointContext.from(context, services);
        return await endpoint.handler(newContext);
      },
      options: this.toPlainEndpointOptions(endpoint.options, services),
    };
  }

  private toPlainEndpointOptions(
    options: EndpointOptions | undefined,
    services: IServiceProvider
  ): ServerEndpointOptions | undefined {
    if (options === undefined) {
      return undefined;
    }

    return {
      middlewares: options.middlewares?.map((x) => this.toMiddlewareFunction(x, services)),
      interceptors: options.interceptors?.map((x) => this.toInterceptorFunction(x, services)),
      guards: options.guards?.map((x) => this.toGuardFunction(x, services)),
      authentication: options.authentication
        ? this.toAuthenticationPolicyFunction(options.authentication, services)
        : undefined,
      authorization: options.authorization
        ? this.toAuthorizationPolicyFunction(options.authorization, services)
        : undefined,
    };
  }

  private toErrorHandlerFunction(
    errorHandlerType: ErrorHandlerType,
    services: IServiceProvider
  ): ServerErrorHandlerFunction {
    if (isConstructor<IErrorHandler | IErrorHandlerFactory>(errorHandlerType)) {
      return ({ req, res, err }) => {
        const service = services.getOrThrow<IErrorHandler | IErrorHandlerFactory>(errorHandlerType);
        const errorHandler = this.toErrorHandlerFunction(service, services);
        return errorHandler({ req, res, err });
      };
    }

    if (isErrorHandlerFunction(errorHandlerType)) {
      return ({ req, res, err }) => {
        const requestContext = RequestContext.from(req, services);
        return errorHandlerType({ req: requestContext, res, err, services });
      };
    }

    if (isIErrorHandler(errorHandlerType)) {
      return ({ req, res, err }) => {
        const requestContext = RequestContext.from(req, services);
        return errorHandlerType.catch(requestContext, res, err);
      };
    }

    if (isIErrorHandlerFactory(errorHandlerType)) {
      const errorHandler = errorHandlerType.createErrorHandler();
      return this.toErrorHandlerFunction(errorHandler, services);
    }

    throw new InvalidOperationError();
  }
}
