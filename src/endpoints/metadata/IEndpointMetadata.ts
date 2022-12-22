import { HttpMethod } from "@/core";
import { MiddlewareParam } from "../MiddlewareParam";

/**
 * Defines a set of accessors for an Endpoint.
 */
export interface IEndpointMetadata {
  /* #region HTTP Method */
  get httpMethod(): HttpMethod | undefined;
  set httpMethod(value: HttpMethod | undefined);
  get httpMethodOrDefault(): HttpMethod;
  /* #endregion */

  /* #region Path */
  get path(): string | undefined;
  set path(value: string | undefined);
  /* #endregion */

  /* #region Middlewares */
  get middlewares(): MiddlewareParam[] | undefined;
  set middlewares(value: MiddlewareParam[] | undefined);
  addMiddleware(value: MiddlewareParam): void;
  /* #endregion */
}
