import {
  UseAuthenticationOptions,
  AuthClaim,
  AuthenticationGuard,
  AuthorizationGuard,
} from "@/auth";
import { authenticationInterceptorStrategy } from "@/auth/authenticationInterceptorStrategy";
import { AppSetupFunction } from "@/builder";
import { HttpContext, HttpMethod, httpContextFactory } from "@/core";
import { ExpressMiddlewareFunction, ExpressRequestHandler } from "@/core/express";
import { GuardAdapter, GuardType } from "@/guards";
import { InterceptorAdapter, InterceptorType } from "@/interceptors";
import { MiddlewareAdapter, MiddlewareType } from "@/middleware";
import { ServiceProvider } from "@tomasjs/core";

export interface EndpointArgs {
  httpContext: HttpContext;
  services: ServiceProvider;
}

export type EndpointFunction = (args: EndpointArgs) => any;

export interface EndpointOptions {
  middlewares?: MiddlewareType[];
  interceptors?: InterceptorType[];
  guards?: GuardType[];
  authentication?: UseAuthenticationOptions;
  authorization?: AuthClaim[];
}

export function endpoint(
  method: HttpMethod,
  path: string,
  func: EndpointFunction,
  options?: EndpointOptions
): AppSetupFunction {
  return (app, container) => {
    const expressHandlers = [
      ...getAuthHandlers(),
      ...getMiddlewareHandlers(),
      ...getInterceptorHandlers(),
      ...getGuardHandlers(),
      getCustomEndpointHandler(),
    ];

    app[method](path, ...expressHandlers);

    function getAuthHandlers(): ExpressMiddlewareFunction[] {
      const expressMiddlewares: ExpressMiddlewareFunction[] = [];

      if (options?.authentication !== undefined) {
        expressMiddlewares.push(
          new InterceptorAdapter(
            container,
            authenticationInterceptorStrategy(options.authentication)
          ).adapt(),
          new GuardAdapter({
            container,
            guard: new AuthenticationGuard(),
          }).adapt()
        );
      }

      if (options?.authorization !== undefined) {
        expressMiddlewares.push(
          new GuardAdapter({
            container,
            guard: new AuthorizationGuard(options.authorization),
          }).adapt()
        );
      }

      return expressMiddlewares;
    }

    function getMiddlewareHandlers(): ExpressMiddlewareFunction[] {
      return (options?.middlewares ?? []).map((middleware) =>
        new MiddlewareAdapter({ container, middleware }).adapt()
      );
    }

    function getInterceptorHandlers(): ExpressMiddlewareFunction[] {
      return (options?.interceptors ?? []).map((interceptor) =>
        new InterceptorAdapter(container, interceptor).adapt()
      );
    }

    function getGuardHandlers(): ExpressMiddlewareFunction[] {
      return (options?.guards ?? []).map((guard) => new GuardAdapter({ container, guard }).adapt());
    }

    function getCustomEndpointHandler(): ExpressRequestHandler {
      return async (req, res) => {
        const httpContext = httpContextFactory(req, res);

        const result = await func({
          httpContext,
          services: container,
        });

        return httpContext.response.send(result);
      };
    }
  };
}
