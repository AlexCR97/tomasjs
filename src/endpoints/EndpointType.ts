import { ClassConstructor } from "@/container";
import { Endpoint } from "./Endpoint";
import { EndpointHandler } from "./types";

export type EndpointType =
  | EndpointHandler<any>
  | Endpoint
  | ClassConstructor<Endpoint>;
