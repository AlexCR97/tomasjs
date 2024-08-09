import { IncomingMessage } from "http";
import { UrlWithParsedQuery, parse } from "url";
import UrlPattern from "url-pattern";
import { QueryParams } from "./QueryParams";
import { IRouteParams, RouteParams } from "./RouteParams";

export class UrlParser {
  private readonly rawUrl: string;
  private readonly parsedUrl: UrlWithParsedQuery;

  constructor(url: string) {
    this.rawUrl = url;
    this.parsedUrl = parse(url, true);
  }

  static from(req: IncomingMessage): UrlParser {
    return new UrlParser(req.url ?? "/");
  }

  matches(pattern: string): boolean {
    const urlPattern = new UrlPattern(pattern);
    const path = this.path();
    const routeParams = urlPattern.match(path);
    return routeParams !== null;
  }

  path(): string {
    return this.parsedUrl.pathname ?? "/";
  }

  queryParams(): QueryParams {
    return QueryParams.from(this.parsedUrl.query);
  }

  routeParams(pattern: string): IRouteParams {
    const urlPattern = new UrlPattern(pattern);
    const path = this.path();
    const routeParams = urlPattern.match(path);
    return new RouteParams(routeParams);
  }
}
