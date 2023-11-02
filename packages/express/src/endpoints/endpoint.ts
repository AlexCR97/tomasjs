import {
  AuthenticationGuard,
  AuthorizationMetadata,
  AuthorizationOptions,
  AuthenticationOptions,
  AuthenticationMetadata,
} from "@/auth";
import { AuthenticatedRequirement } from "@/auth/policies";
import { AppSetupFunction } from "@/builder";
import { HttpContext, HttpMethod, httpContextFactory } from "@/core";
import {
  ExpressMiddlewareFunction,
  ExpressPathNormalizer,
  ExpressRequestHandler,
} from "@/core/express";
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
  authenticate?: AuthenticationMetadata;
  authorize?: AuthorizationMetadata;
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

    const normalizedPath = new ExpressPathNormalizer(path).normalize();
    app[method](normalizedPath, ...expressHandlers);

    function getAuthHandlers(): ExpressMiddlewareFunction[] {
      const expressMiddlewares: ExpressMiddlewareFunction[] = [];

      if (options?.authenticate !== undefined && options.authenticate.scheme) {
        const authenticationOptions = container.get(AuthenticationOptions);
        const schemeInterceptor = authenticationOptions.getScheme(options.authenticate.scheme);
        expressMiddlewares.push(
          new InterceptorAdapter(container, schemeInterceptor).adapt(),
          new GuardAdapter({
            container,
            guard: new AuthenticationGuard(),
          }).adapt()
        );
      }

      if (options?.authorize !== undefined && options.authorize.policy) {
        const authorizationOptions = container.get(AuthorizationOptions);
        const policy = authorizationOptions.getPolicy(options.authorize.policy);
        const guardMiddlewares = [new AuthenticatedRequirement(), ...policy.requirements].map(
          (guard) => new GuardAdapter({ container, guard }).adapt()
        );
        expressMiddlewares.push(...guardMiddlewares);
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
