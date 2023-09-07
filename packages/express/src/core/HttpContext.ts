import { HttpRequest, httpRequestFactory } from "./HttpRequest";
import { HttpResponseWriter, httpResponseWriterFactory } from "./HttpResponseWriter";
import { HttpUser } from "./HttpUser";
import { Request, Response } from "express";

export interface HttpContext {
  readonly request: HttpRequest;
  readonly response: HttpResponseWriter;
  readonly user: HttpUser;
}

class HttpContextImpl implements HttpContext {
  constructor(
    readonly request: HttpRequest,
    readonly response: HttpResponseWriter,
    readonly user: HttpUser
  ) {}
}

export function httpContextFactory(req: Request, res: Response): HttpContext {
  const request = httpRequestFactory(req);
  const response = httpResponseWriterFactory(res);
  const user = req.user;
  return new HttpContextImpl(request, response, user);
}

// TODO Write test
// TODO Improve type check
export function isHttpContext(obj: any): obj is HttpContext {
  const hasRequestInstance = Reflect.has(obj, "request");
  const hasResponseInstance = Reflect.has(obj, "response");
  const hasUserInstance = Reflect.has(obj, "user");
  return hasRequestInstance && hasResponseInstance && hasUserInstance;
}
