import { singleton } from "tsyringe";
import { response } from "express";
import { RequestContext } from "./RequestContext";

@singleton()
export class HttpContext {
  request!: RequestContext; // TODO Make readonly?
  response!: typeof response; // TODO Make readonly?
}
