import { ClassConstructor } from "@tomasjs/core";
import { Endpoint } from "./Endpoint";
import { EndpointHandler } from "./types";

export type EndpointType<TEndpoint extends Endpoint = Endpoint> =
  | EndpointHandler<any>
  | TEndpoint
  | ClassConstructor<TEndpoint>;
