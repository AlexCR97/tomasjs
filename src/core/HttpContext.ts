import { response } from "express";
import { RequestContext } from "./RequestContext";
import { UserContext } from "./UserContext";
import { ResponseAdapter } from "@/responses";
import { singleton } from "@/container";

@singleton()
export class HttpContext {
  request!: RequestContext; // TODO Make readonly?
  response!: typeof response; // TODO Make readonly?
  user?: UserContext;
  readonly metadata = new Map<string, any>();

  respond(data: any): void {
    ResponseAdapter.fromThomasToExpress(this.response, data);
  }
}
