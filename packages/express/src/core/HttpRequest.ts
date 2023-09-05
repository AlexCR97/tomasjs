import { IncomingHttpHeaders } from "http";
import { Pipe, TomasError, TransformType } from "@tomasjs/core";
import { TransformResultResolver } from "@/transforms";
import { HttpMethod } from "./HttpMethod";
import { Request } from "express";

export interface HttpRequest {
  readonly method: HttpMethod;
  readonly path: string;
  readonly headers: IncomingHttpHeaders;
  readonly params: Record<string, string | undefined>;
  readonly query: Record<string, string | string[] | undefined>;
  readonly body: Record<string, any>;

  /* #region Headers */
  getHeader(key: string): string;
  getHeaderOrDefault(key: string): string | undefined;
  getHeaders(key: string): string[];
  getHeadersOrDefault(key: string): string[] | undefined;
  /* #endregion */

  /* #region Params */
  getParam<T = string>(key: string, options?: { transform?: TransformType<string, T> }): T;
  getParamOrDefault<T = string>(
    key: string,
    options?: { transform?: TransformType<string, T> }
  ): T | undefined;
  /* #endregion */

  /* #region Query */
  getQuery<T = string>(key: string): T;
  getQueryOrDefault<T = string>(key: string): T | undefined;
  getQueries<T = string>(key: string): T[];
  getQueriesOrDefault<T = string>(key: string): T[] | undefined;
  /* #endregion */

  /* #region Body */
  getBody<T = Record<string, any>>(options?: {
    transform?: TransformType<Record<string, any>, T>;
  }): T;
  /* #endregion */
}

class HttpRequestImpl implements HttpRequest {
  constructor(
    readonly method: HttpMethod,
    readonly path: string,
    readonly headers: IncomingHttpHeaders,
    readonly params: Record<string, string | undefined>,
    readonly query: Record<string, string | string[] | undefined>,
    readonly body: Record<string, any>
  ) {}

  /* #region Headers */

  getHeader(key: string): string {
    const header = this.getHeaderOrDefault(key);

    if (header === undefined) {
      throw new TomasError(`Unknown header "${key}"`);
    }

    return header;
  }

  getHeaderOrDefault(key: string): string | undefined {
    const header = this.headers[key];

    if (typeof header === "string" || typeof header === "undefined") {
      return header;
    }

    throw new TomasError(
      `Cannot parse header "${key}" of type "string[]" into type "string | undefined". Please use ${this.getHeaders.name} or ${this.getHeadersOrDefault.name} instead.`,
      { data: { header } }
    );
  }

  getHeaders(key: string): string[] {
    const headers = this.getHeadersOrDefault(key);

    if (headers === undefined) {
      throw new TomasError(`Unknown headers "${key}"`);
    }

    return headers;
  }

  getHeadersOrDefault(key: string): string[] | undefined {
    const headers = this.headers[key];

    if (Array.isArray(headers) || typeof headers === "undefined") {
      return headers;
    }

    throw new TomasError(
      `Cannot parse header "${key}" of type "string" into type "string[] | undefined". Please use ${this.getHeader.name} or ${this.getHeaderOrDefault.name} instead.`,
      { data: { headers } }
    );
  }

  /* #endregion */

  /* #region Params */

  getParam<T = string>(key: string, options?: { transform?: TransformType<string, T> }): T {
    throw new Error("Not implemented");
  }

  getParamOrDefault<T = string>(
    key: string,
    options?: { transform?: TransformType<string, T> }
  ): T | undefined {
    return new Pipe(key)
      .apply((key) => this.params[key])
      .apply((param) => {
        if (param === undefined) {
          return undefined;
        }

        if (options?.transform === undefined) {
          return param as T;
        }

        return new TransformResultResolver(options.transform).resolve(param);
      })
      .get();
  }

  /* #endregion */

  /* #region Query */

  getQuery<T = string>(key: string, options?: { transform?: TransformType<string, T> }): T {
    const query = this.getQueryOrDefault(key, options);

    if (query === undefined) {
      throw new TomasError(`Unknown query "${key}"`);
    }

    return query;
  }

  getQueryOrDefault<T = string>(
    key: string,
    options?: { transform?: TransformType<string, T> }
  ): T | undefined {
    const query = this.query[key];

    if (query === undefined) {
      return undefined;
    }

    if (typeof query === "string") {
      return options?.transform
        ? new TransformResultResolver(options.transform).resolve(query)
        : (query as T);
    }

    throw new TomasError(
      `Cannot parse query "${key}" of type "string[]" into type "string | undefined". Please use ${this.getQueries.name} or ${this.getQueriesOrDefault.name} instead.`,
      { data: { query } }
    );
  }

  getQueries<T = string>(key: string, options?: { transform?: TransformType<string, T> }): T[] {
    const queries = this.getQueriesOrDefault(key, options);

    if (queries === undefined) {
      throw new TomasError(`Unknown queries "${key}"`);
    }

    return queries;
  }

  getQueriesOrDefault<T = string>(
    key: string,
    options?: { transform?: TransformType<string, T> }
  ): T[] | undefined {
    const queries = this.query[key];

    if (queries === undefined) {
      return undefined;
    }

    if (Array.isArray(queries)) {
      return queries.map((query) => {
        return options?.transform
          ? new TransformResultResolver(options.transform).resolve(query)
          : (query as T);
      });
    }

    throw new TomasError(
      `Cannot parse query "${key}" of type "string" into type "string[] | undefined". Please use ${this.getQuery.name} or ${this.getQueryOrDefault.name} instead.`,
      { data: { queries } }
    );
  }

  /* #endregion */

  /* #region Body */

  getBody<T = Record<string, any>>(options?: {
    transform?: TransformType<Record<string, any>, T>;
  }): T {
    return new Pipe(this.body)
      .apply((body) => {
        return options?.transform
          ? new TransformResultResolver(options.transform).resolve(body)
          : (body as T);
      })
      .get();
  }

  /* #endregion */
}

export function httpRequestFactory(req: Request): HttpRequest {
  return new HttpRequestImpl(
    httpMethodFactory(req.method),
    req.path,
    req.headers,
    req.params,
    req.query as Record<string, string | string[] | undefined>, // TODO Improve typing here
    req.body
  );
}

function httpMethodFactory(method: string): HttpMethod {
  if (method.trim().toLowerCase() === "get") {
    return "get";
  }

  if (method.trim().toLowerCase() === "post") {
    return "post";
  }

  if (method.trim().toLowerCase() === "put") {
    return "put";
  }

  if (method.trim().toLowerCase() === "patch") {
    return "patch";
  }

  if (method.trim().toLowerCase() === "delete") {
    return "delete";
  }

  throw new TomasError(`Unknown method "${method}"`);
}
