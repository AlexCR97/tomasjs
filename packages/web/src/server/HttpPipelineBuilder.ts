import { AuthenticationPolicyFunction, AuthorizationPolicyFunction } from "@/auth";
import { Endpoint, PlainEndpoint, EndpointHandler, EndpointOptions } from "@/endpoint";
import { ErrorHandlerFunction } from "@/error-handler";
import { GuardFunction } from "@/guard";
import { InterceptorFunction } from "@/interceptor";
import { MiddlewareFunction, MiddlewareAggregate } from "@/middleware";
import { HttpResponse } from "@/server";
import { statusCode } from "@/StatusCode";
import { InvalidOperationError } from "@tomasjs/core/errors";
import { HttpMethod, PlainTextContent } from "@tomasjs/core/http";

export type HttpPipelineBuilderDelegate = (pipeline: IHttpPipelineBuilder) => void;

export interface IHttpPipelineBuilder {
  delegate(delegate: HttpPipelineBuilderDelegate): this;
  use(middleware: MiddlewareFunction): this;
  useInterceptor(interceptor: InterceptorFunction): this;
  useGuard(guard: GuardFunction): this;
  useAuthentication(policy: AuthenticationPolicyFunction): this;
  useAuthorization(policy: AuthorizationPolicyFunction): this;
  useEndpoint(endpoint: Endpoint): this;
  useEndpoint(endpoint: PlainEndpoint): this;
  useEndpoint(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler,
    options?: EndpointOptions
  ): this;
  useErrorHandler(handler: ErrorHandlerFunction): this;
}

export class HttpPipelineBuilder implements IHttpPipelineBuilder {
  private readonly middlewares: MiddlewareFunction[] = [];
  private readonly interceptors: InterceptorFunction[] = [];
  private readonly guards: GuardFunction[] = [];
  private readonly authenticationPolicies: AuthenticationPolicyFunction[] = [];
  private readonly authorizationPolicies: AuthorizationPolicyFunction[] = [];
  private readonly endpoints: PlainEndpoint[] = [];
  private errorHandler: ErrorHandlerFunction | undefined;

  private readonly defaultErrorHandler: ErrorHandlerFunction = async ({ res }) => {
    const response = new HttpResponse({
      status: statusCode.internalServerError,
      content: PlainTextContent.from("An unexpected error occurred on the server"),
    });

    return await res
      .withContent(response.content)
      .withHeaders(response.headers)
      .withStatus(response.status)
      .send();
  };

  private readonly terminalMiddleware: MiddlewareFunction = async ({ res }) => {
    if (res.sent) {
      return;
    }

    return await res.send();
  };

  delegate(delegate: HttpPipelineBuilderDelegate): this {
    delegate(this);
    return this;
  }

  use(middleware: MiddlewareFunction): this {
    this.middlewares.push(middleware);
    return this;
  }

  useInterceptor(interceptor: InterceptorFunction): this {
    this.interceptors.push(interceptor);
    return this;
  }

  useGuard(guard: GuardFunction): this {
    this.guards.push(guard);
    return this;
  }

  useAuthentication(policy: AuthenticationPolicyFunction): this {
    this.authenticationPolicies.push(policy);
    return this;
  }

  useAuthorization(policy: AuthorizationPolicyFunction): this {
    this.authorizationPolicies.push(policy);
    return this;
  }

  useEndpoint(endpoint: Endpoint): this;
  useEndpoint(endpoint: PlainEndpoint): this;
  useEndpoint(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler,
    options?: EndpointOptions
  ): this;
  useEndpoint(...args: any[]): this {
    if (args.length === 1) {
      const endpoint = args[0];

      if (endpoint instanceof Endpoint) {
        return this.addEndpoint(endpoint.toPlain());
      } else {
        return this.addEndpoint(endpoint);
      }
    }

    if (args.length === 3 || args.length === 4) {
      const [method, path, handler, options] = args;
      return this.addEndpoint({ method, path, handler, options });
    }

    throw new InvalidOperationError();
  }

  private addEndpoint(endpoint: PlainEndpoint): this {
    this.endpoints.push(endpoint);
    return this;
  }

  useErrorHandler(handler: ErrorHandlerFunction): this {
    this.errorHandler = handler;
    return this;
  }

  build(): MiddlewareFunction[] {
    return new MiddlewareAggregate()
      .addErrorHandler(this.errorHandler ?? this.defaultErrorHandler)
      .addMiddleware(...this.middlewares)
      .addInterceptor(...this.interceptors)
      .addGuard(...this.guards)
      .addAuthentication(...this.authenticationPolicies)
      .addAuthorization(...this.authorizationPolicies)
      .addEndpoint(...this.endpoints)
      .addMiddleware(this.terminalMiddleware)
      .get();
  }
}
