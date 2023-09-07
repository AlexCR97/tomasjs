import { ClassConstructor } from "@tomasjs/core";
import { Interceptor } from "./Interceptor";
import { InterceptorFunction } from "./InterceptorFunction";
import { InterceptorFactory } from "./InterceptorFactory";

export type InterceptorType =
  | InterceptorFunction
  | Interceptor
  | ClassConstructor<Interceptor>
  | InterceptorFactory;
