import { TomasError } from "@tomasjs/core/errors";
import { ParsedUrlQuery } from "querystring";

type MutablePlainQueryParams = Record<string, string | string[] | null>;
export type PlainQueryParams = Readonly<MutablePlainQueryParams>;

export interface IQueryParams {
  get keys(): (keyof PlainQueryParams)[];
  all(key: string): string[];
  first(key: string): string | null;
  firstOrThrow(key: string): string;
  get(key: string): string | string[] | null;
  getOrThrow(key: string): string | string[];
  toPlain(): PlainQueryParams;
  toString(options?: { urlEncode?: boolean }): string;
}

export class QueryParams implements IQueryParams {
  private readonly query: PlainQueryParams;
  private readonly queryKeys: (keyof PlainQueryParams)[];

  constructor(query: PlainQueryParams) {
    this.query = query;
    this.queryKeys = Object.keys(query) as unknown as (keyof PlainQueryParams)[]; // TODO Avoid using "as"
  }

  static from(query: ParsedUrlQuery): QueryParams {
    const plainQueryParams = this.toPlainQueryParams(query);
    return new QueryParams(plainQueryParams);
  }

  private static toPlainQueryParams(query: ParsedUrlQuery): PlainQueryParams {
    const plainQueryParams: MutablePlainQueryParams = {};
    const keys = Object.keys(query);

    for (const key of keys) {
      const value = query[key];
      plainQueryParams[key] = value ?? null;
    }

    return plainQueryParams;
  }

  static empty(): QueryParams {
    return new QueryParams({});
  }

  get keys(): (keyof PlainQueryParams)[] {
    return this.queryKeys;
  }

  all(key: string): string[] {
    const value = this.get(key);

    if (value === null) {
      return [];
    }

    if (typeof value === "string") {
      return [value];
    }

    return value;
  }

  first(key: string): string | null {
    const value = this.get(key);

    if (value === null) {
      return value;
    }

    if (typeof value === "string") {
      return value;
    }

    return value[0];
  }

  firstOrThrow(key: string): string {
    const value = this.first(key);

    if (value === null) {
      throw new QueryParamNotFoundError(key);
    }

    return value;
  }

  get(key: string): string | string[] | null {
    return this.query[key] ?? null;
  }

  getOrThrow(key: string): string | string[] {
    const value = this.get(key);

    if (value === null) {
      throw new QueryParamNotFoundError(key);
    }

    return value;
  }

  toPlain(): PlainQueryParams {
    return this.query;
  }

  toString(options?: { urlEncode?: boolean }): string {
    const parts: string[] = [];

    for (const key of this.keys) {
      const value = this.getOrThrow(key);

      if (typeof value === "string") {
        if (options?.urlEncode === true) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        } else {
          parts.push(`${key}=${value}`);
        }
      } else {
        for (const v of value) {
          if (options?.urlEncode === true) {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
          } else {
            parts.push(`${key}=${v}`);
          }
        }
      }
    }

    return parts.join("&");
  }
}

export class QueryParamNotFoundError extends TomasError {
  constructor(key: string) {
    super("web/QueryParamNotFound", `No such query parameter with key "${key}"`);
  }
}
