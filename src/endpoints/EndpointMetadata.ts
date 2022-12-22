import { ClassConstructor } from "@/container";
import { HttpMethod } from "@/core";
import { Endpoint } from "./Endpoint";
import { isEndpoint } from "./isEndpoint";
import { MiddlewareParam } from "./MiddlewareParam";

/**
 * Uses reflect-metadata to define a set of accessors for
 * an Endpoint constructor or an Endpoint instance.
 */
export class EndpointMetadata<TEndpoint extends Endpoint = Endpoint> {
  constructor(private readonly endpoint: TEndpoint | ClassConstructor<TEndpoint>) {}

  /* #region HTTP Method */

  static readonly httpMethodKey = "tomasjs:endpoint:httpMethod";

  get httpMethod(): HttpMethod | undefined {
    return this.getMetadata<HttpMethod | undefined>(EndpointMetadata.httpMethodKey);
  }

  set httpMethod(value: HttpMethod | undefined) {
    this.setMetadata(EndpointMetadata.httpMethodKey, value);
  }

  get httpMethodOrDefault(): HttpMethod {
    return this.getMetadata<HttpMethod | undefined>(EndpointMetadata.httpMethodKey) ?? "get";
  }

  /* #endregion */

  /* #region Path */

  static readonly pathKey = "tomasjs:endpoint:path";

  get path(): string | undefined {
    return this.getMetadata<string | undefined>(EndpointMetadata.pathKey);
  }

  set path(value: string | undefined) {
    this.setMetadata(EndpointMetadata.pathKey, value);
  }

  /* #endregion */

  /* #region Middlewares */

  static readonly middlewaresKey = "tomasjs:endpoint:middlewares";

  get middlewares(): MiddlewareParam[] | undefined {
    return this.getMetadata<MiddlewareParam[] | undefined>(EndpointMetadata.middlewaresKey);
  }
  set middlewares(value: MiddlewareParam[] | undefined) {
    this.setMetadata(EndpointMetadata.middlewaresKey, value);
  }

  addMiddleware(value: MiddlewareParam) {
    if (this.middlewares === undefined) {
      this.middlewares = [];
    }

    this.middlewares.push(value);
  }
  /* #endregion */

  private get endpointPrototype() {
    return isEndpoint(this.endpoint)
      ? Object.getPrototypeOf(this.endpoint)
      : this.endpoint.prototype;
  }

  private setMetadata(key: string, value: any) {
    Reflect.defineMetadata(key, value, this.endpointPrototype);
  }

  private getMetadata<T>(key: string): T {
    return Reflect.getMetadata(key, this.endpointPrototype);
  }
}
