import { HttpHeader, HttpHeaders, HttpMethod, PlainHttpHeaders } from "@tomasjs/core/http";
import { IQueryParams } from "./QueryParams";
import { RequestBody } from "./RequestBody";
import { IRouteParams } from "./RouteParams";
import { Content } from "@/content";

export type Endpoint = {
  method: HttpMethod;
  path: string;
  handler: EndpointHandler;
};

export type EndpointHandler = (
  context: EndpointContext
) => EndpointResponse | Promise<EndpointResponse>;

export type EndpointContext = {
  method: HttpMethod;
  path: string;
  headers: Readonly<PlainHttpHeaders>;
  params: IRouteParams;
  query: IQueryParams;
  body: RequestBody<unknown>;
};

export class EndpointResponse {
  readonly status: number | null;
  readonly content: Content<unknown> | null;
  readonly headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null;

  constructor(options?: EndpointResponseOptions) {
    this.status = options?.status ?? null;
    this.content = options?.content ?? null;
    this.headers = options?.headers ?? null;
  }
}

export type EndpointResponseOptions = {
  status?: number;
  content?: Content<unknown>;
  headers?: HttpHeader[] | PlainHttpHeaders | HttpHeaders;
};

export function isEndpoint(obj: any): obj is Endpoint {
  if (obj === null || obj === undefined) {
    return false;
  }

  const method = obj[<keyof Endpoint>"method"];
  const path = obj[<keyof Endpoint>"path"];
  const handler = obj[<keyof Endpoint>"handler"];
  return typeof method === "string" && typeof path === "string" && typeof handler === "function";
}
