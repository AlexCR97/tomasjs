import { IUserReader } from "@/auth";
import { IEndpointContext } from "@/endpoint";
import { HttpResponse, IQueryParams, IRouteParams } from "@/server";
import { IServiceProvider } from "@tomasjs/core/dependency-injection";
import { HttpMethod, IHttpContent, PlainHttpHeaders } from "@tomasjs/core/http";

export type WebAppEndpoint = {
  method: HttpMethod;
  path: string;
  handler: WebAppEndpointHandler;
  // options?: EndpointOptions; // TODO Support options
};

export type WebAppEndpointHandler = (
  context: IWebAppEndpointContext
) => HttpResponse | Promise<HttpResponse>;

export interface IWebAppEndpointContext extends IEndpointContext {
  readonly services: IServiceProvider;
}

export class WebAppEndpointContext implements IWebAppEndpointContext {
  constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly path: string,
    readonly headers: Readonly<PlainHttpHeaders>,
    readonly params: IRouteParams,
    readonly query: IQueryParams,
    readonly body: IHttpContent<unknown>,
    readonly user: IUserReader,
    readonly services: IServiceProvider
  ) {}

  static from(context: IEndpointContext, services: IServiceProvider): WebAppEndpointContext {
    return new WebAppEndpointContext(
      context.method,
      context.url,
      context.path,
      context.headers,
      context.params,
      context.query,
      context.body,
      context.user,
      services
    );
  }
}
