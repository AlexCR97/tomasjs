import { EndpointResponse } from "@/response";
import { HttpMethod } from "@tomasjs/core/http";

export type Endpoint = {
  method: HttpMethod;
  path: string;
  handler: EndpointHandler;
};

export type EndpointHandler = () => EndpointResponse | Promise<EndpointResponse>;

export function isEndpoint(obj: any): obj is Endpoint {
  if (obj === null || obj === undefined) {
    return false;
  }

  const method = obj[<keyof Endpoint>"method"];
  const path = obj[<keyof Endpoint>"path"];
  const handler = obj[<keyof Endpoint>"handler"];
  return typeof method === "string" && typeof path === "string" && typeof handler === "function";
}
