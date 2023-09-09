import { AppSetupFunction } from "@/builder";
import { HttpContext, HttpMethod, httpContextFactory } from "@/core";
import { ExpressMiddlewareFunction } from "@/core/express";
import { GuardAdapter, GuardType } from "@/guards";
import { InterceptorAdapter, InterceptorType } from "@/interceptors";
import { MiddlewareAdapter, MiddlewareType } from "@/middleware";
import { ServiceProvider } from "@tomasjs/core";

export interface EndpointArgs {
  httpContext: HttpContext;
  services: ServiceProvider;
}

export type EndpointFunction = (args: EndpointArgs) => any;

export function endpoint(
  method: HttpMethod,
  path: string,
  func: EndpointFunction,
  options?: {
    middlewares?: MiddlewareType[];
    interceptors?: InterceptorType[];
    guards?: GuardType[];
  }
): AppSetupFunction {
  return (app, container) => {
    const expressMiddlewares: ExpressMiddlewareFunction[] = [
      ...(options?.middlewares ?? []).map((middleware) =>
        new MiddlewareAdapter({ container, middleware }).adapt()
      ),
      ...(options?.interceptors ?? []).map((interceptor) =>
        new InterceptorAdapter(container, interceptor).adapt()
      ),
      ...(options?.guards ?? []).map((guard) => new GuardAdapter({ container, guard }).adapt()),
    ];

    app[method](path, ...expressMiddlewares, async (req, res) => {
      const httpContext = httpContextFactory(req, res);

      const result = await func({
        httpContext,
        services: container,
      });

      return httpContext.response.send(result);
    });
  };
}
