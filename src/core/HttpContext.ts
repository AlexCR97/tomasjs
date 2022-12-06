import { singleton } from "tsyringe";
import { response } from "express";
import { RequestContext } from "./RequestContext";
import { UserContext } from "./UserContext";

@singleton()
export class HttpContext {
  request!: RequestContext; // TODO Make readonly?
  response!: typeof response; // TODO Make readonly?
  user?: UserContext;
  readonly metadata = new Map<string, any>();
}
