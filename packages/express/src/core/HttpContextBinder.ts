import { Request, Response } from "express";
import { RequestContext } from "./RequestContext";
import { HttpContext } from "./HttpContext";

export abstract class HttpContextBinder {
  static fromExpress(httpContext: HttpContext, req: Request, res: Response) {
    httpContext.request = new RequestContext(req);
    httpContext.response = res;
  }
}
