import { ContainerSetup } from "@/dependency-injection/ContainerSetup";
import { HttpClient } from "./HttpClient";
import { IServiceProvider } from "@/dependency-injection/ServiceProvider";
import { HttpHeaders, PlainHttpHeaders } from "./HttpHeaders";
import {
  IRequestInterceptor,
  IResponseInterceptor,
  RequestInterceptor,
  ResponseInterceptor,
  isRequestInterceptorFunction,
  isRequestInterceptorInstance,
  isResponseInterceptorFunction,
  isResponseInterceptorInstance,
} from "./Interceptor";
import { Constructor, isConstructor } from "@/dependency-injection/Constructor";
import { ServiceFactory, isServiceFactory } from "@/dependency-injection/ServiceFactory";
import { InvalidOperationError } from "@/errors";

export class HttpClientSetup {
  private readonly token: string;

  private baseUrl: string | undefined;

  private headers: PlainHttpHeaders | HttpHeaders | undefined;

  private requestInterceptor:
    | RequestInterceptor
    | Constructor<IRequestInterceptor>
    | ServiceFactory<RequestInterceptor>
    | undefined;

  private responseInterceptor:
    | ResponseInterceptor
    | Constructor<IResponseInterceptor>
    | ServiceFactory<ResponseInterceptor>
    | undefined;

  constructor(token: string) {
    this.token = token;
  }

  withBaseUrl(baseUrl: string | undefined): HttpClientSetup {
    this.baseUrl = baseUrl;
    return this;
  }

  withHeaders(headers: PlainHttpHeaders | HttpHeaders | undefined): HttpClientSetup {
    this.headers = headers;
    return this;
  }

  withRequestInterceptor(requestInterceptor: RequestInterceptor | undefined): HttpClientSetup {
    this.requestInterceptor = requestInterceptor;
    return this;
  }

  withResponseInterceptor(responseInterceptor: ResponseInterceptor | undefined): HttpClientSetup {
    this.responseInterceptor = responseInterceptor;
    return this;
  }

  build(): ContainerSetup {
    return (container) => {
      if (isConstructor<IRequestInterceptor>(this.requestInterceptor)) {
        container.add("scoped", this.requestInterceptor);
      }

      if (isConstructor<IResponseInterceptor>(this.responseInterceptor)) {
        container.add("scoped", this.responseInterceptor);
      }

      container.add("scoped", this.token, (services: IServiceProvider) => {
        return new HttpClient({
          baseUrl: this.baseUrl,
          headers: this.headers,
          requestInterceptor: this.resolveRequestInterceptor(services),
          responseInterceptor: this.resolveResponseInterceptor(services),
        });
      });
    };
  }

  private resolveRequestInterceptor(services: IServiceProvider): RequestInterceptor | undefined {
    if (this.requestInterceptor === undefined) {
      return undefined;
    }

    if (isRequestInterceptorFunction(this.requestInterceptor)) {
      return this.requestInterceptor;
    }

    if (isRequestInterceptorInstance(this.requestInterceptor)) {
      return this.requestInterceptor;
    }

    if (isConstructor<IRequestInterceptor>(this.requestInterceptor)) {
      return services.get(this.requestInterceptor);
    }

    if (isServiceFactory<RequestInterceptor>(this.requestInterceptor)) {
      return this.requestInterceptor(services);
    }

    throw new InvalidOperationError();
  }

  private resolveResponseInterceptor(services: IServiceProvider): ResponseInterceptor | undefined {
    if (this.responseInterceptor === undefined) {
      return undefined;
    }

    if (isResponseInterceptorFunction(this.responseInterceptor)) {
      return this.responseInterceptor;
    }

    if (isResponseInterceptorInstance(this.responseInterceptor)) {
      return this.responseInterceptor;
    }

    if (isConstructor<IResponseInterceptor>(this.responseInterceptor)) {
      return services.get(this.responseInterceptor);
    }

    if (isServiceFactory<ResponseInterceptor>(this.responseInterceptor)) {
      return this.responseInterceptor(services);
    }

    throw new InvalidOperationError();
  }
}
