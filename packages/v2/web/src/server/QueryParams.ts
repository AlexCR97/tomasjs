import { TomasError } from "@tomasjs/core/errors";
import { ParsedUrlQuery } from "querystring";

type MutablePlainQueryParams = Record<string, string | string[] | null>;
export type PlainQueryParams = Readonly<MutablePlainQueryParams>;

export interface IQueryParams {
  get keys(): keyof PlainQueryParams[];
  all(key: string): string[];
  first(key: string): string | null;
  firstOrThrow(key: string): string;
  get(key: string): string | string[] | null;
  getOrThrow(key: string): string | string[];
  toPlain(): PlainQueryParams;
}

export class QueryParams implements IQueryParams {
  private readonly query: PlainQueryParams;
  private readonly queryKeys: keyof PlainQueryParams[];

  constructor(query: ParsedUrlQuery) {
    const plainQueryParams = QueryParams.toPlainQueryParams(query);
    this.query = plainQueryParams;

    // TODO Avoid using "as"
    this.queryKeys = Object.keys(plainQueryParams) as unknown as keyof PlainQueryParams[];
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

  get keys(): keyof PlainQueryParams[] {
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
}

export class QueryParamNotFoundError extends TomasError {
  constructor(key: string) {
    super("web/QueryParamNotFound", `No such query parameter with key "${key}"`);
  }
}
