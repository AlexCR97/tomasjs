import { HttpMethod, HttpRequest } from "@/core";
import { httpRequestFactory } from "@/core/HttpRequest";
import { TransformType } from "@tomasjs/core";
import { Request } from "express";
import { QueryParams } from "./QueryParams";
import { RequestBody } from "./RequestBody";
import { RequestHeaders } from "./RequestHeaders";
import { RouteParams } from "./RouteParams";

export interface HttpRequestWriter {
  readonly method: HttpMethod;
  readonly path: string;
  readonly headers: Readonly<RequestHeaders>;
  readonly params: Readonly<RouteParams>;
  readonly query: Readonly<QueryParams>;
  readonly body: Readonly<RequestBody>;

  /* #region Headers */
  getHeader(key: string): string;
  getHeaderOrDefault(key: string): string | undefined;
  getHeaders(key: string): string[];
  getHeadersOrDefault(key: string): string[] | undefined;
  setHeader(key: string, value: string | string[]): HttpRequest;
  removeHeader(key: string): HttpRequest;
  /* #endregion */

  /* #region Params */
  getParam<T = string>(key: string, options?: { transform?: TransformType<string, T> }): T;
  getParamOrDefault<T = string>(
    key: string,
    options?: { transform?: TransformType<string, T> }
  ): T | undefined;
  setParam(key: string, value: string): HttpRequest;
  /* #endregion */

  /* #region Query */
  getQuery<T = string>(key: string): T;
  getQueryOrDefault<T = string>(key: string): T | undefined;
  getQueries<T = string>(key: string): T[];
  getQueriesOrDefault<T = string>(key: string): T[] | undefined;
  setQuery(key: string, value: string | string[]): HttpRequest;
  /* #endregion */

  /* #region Body */
  getBody<T = RequestBody>(options?: { transform?: TransformType<RequestBody, T> }): T;
  setBody(body: RequestBody): HttpRequest;
  /* #endregion */
}

export function httpRequestWriterFactory(req: Request): HttpRequestWriter {
  return httpRequestFactory(req);
}
