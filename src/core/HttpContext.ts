import { singleton } from "tsyringe";
import { response } from "express";
import { RequestContext } from "./RequestContext";

@singleton()
export class HttpContext {
  readonly request!: RequestContext;
  readonly response!: typeof response;
}
