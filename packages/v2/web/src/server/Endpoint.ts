import { EndpointResponse } from "@/response";
import { HttpMethod } from "@tomasjs/core/http";
import { QueryParams } from "./QueryParams";
import { RequestBody } from "./RequestBody";

export type Endpoint = {
  method: HttpMethod;
  path: string;
  handler: EndpointHandler;
};

export type EndpointHandler = (
  context: EndpointContext
) => EndpointResponse | Promise<EndpointResponse>;

export type EndpointContext = {
  body: RequestBody<unknown>;
  query: QueryParams;
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
