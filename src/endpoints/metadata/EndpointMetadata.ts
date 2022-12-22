import { HttpMethod } from "@/core";
import { MiddlewareParam } from "../MiddlewareParam";
import { EndpointMetadataKeys } from "./EndpointMetadataKeys";
import { IEndpointMetadata } from "./IEndpointMetadata";

/**
 * Defines a set of accessors for an abstract Endpoint.
 */
export abstract class EndpointMetadata implements IEndpointMetadata {
  protected abstract setMetadata(key: string, value: any): void;
  protected abstract getMetadata<T>(key: string): T;

  /* #region HTTP Method */

  get httpMethod(): HttpMethod | undefined {
    return this.getMetadata<HttpMethod | undefined>(EndpointMetadataKeys.httpMethodKey);
  }

  set httpMethod(value: HttpMethod | undefined) {
    this.setMetadata(EndpointMetadataKeys.httpMethodKey, value);
  }

  get httpMethodOrDefault(): HttpMethod {
    return this.getMetadata<HttpMethod | undefined>(EndpointMetadataKeys.httpMethodKey) ?? "get";
  }

  /* #endregion */

  /* #region Path */

  get path(): string | undefined {
    return this.getMetadata<string | undefined>(EndpointMetadataKeys.pathKey);
  }

  set path(value: string | undefined) {
    this.setMetadata(EndpointMetadataKeys.pathKey, value);
  }

  /* #endregion */

  /* #region Middlewares */

  get middlewares(): MiddlewareParam[] | undefined {
    return this.getMetadata<MiddlewareParam[] | undefined>(EndpointMetadataKeys.middlewaresKey);
  }

  set middlewares(value: MiddlewareParam[] | undefined) {
    this.setMetadata(EndpointMetadataKeys.middlewaresKey, value);
  }

  addMiddleware(value: MiddlewareParam) {
    if (this.middlewares === undefined) {
      this.middlewares = [];
    }

    this.middlewares.push(value);
  }

  /* #endregion */
}
