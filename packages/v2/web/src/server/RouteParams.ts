import { TomasError } from "@tomasjs/core/errors";

export type PlainRouteParams = Readonly<Record<string, string>>;

export interface IRouteParams {
  get keys(): (keyof PlainRouteParams)[];
  get(key: string): string | null;
  getOrThrow(key: string): string;
  toPlain(): PlainRouteParams;
}

export class RouteParams implements IRouteParams {
  private readonly routeParams: PlainRouteParams;
  private readonly routeParamsKeys: (keyof PlainRouteParams)[];

  constructor(route: PlainRouteParams) {
    this.routeParams = route;
    this.routeParamsKeys = Object.keys(route);
  }

  get keys(): (keyof PlainRouteParams)[] {
    return this.routeParamsKeys;
  }

  get(key: string): string | null {
    return this.routeParams[key] ?? null;
  }

  getOrThrow(key: string): string {
    const value = this.get(key);

    if (value === null) {
      throw new RouteParamNotFoundError(key);
    }

    return value;
  }

  toPlain(): PlainRouteParams {
    return this.routeParams;
  }
}

export class RouteParamNotFoundError extends TomasError {
  constructor(key: string) {
    super("web/RouteParamNotFound", `No such route parameter with key "${key}"`);
  }
}
