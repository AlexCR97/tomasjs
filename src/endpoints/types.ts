import { HttpContext } from "@/core";

export type EndpointHandler<TResponse> = (context: HttpContext) => TResponse | Promise<TResponse>;
