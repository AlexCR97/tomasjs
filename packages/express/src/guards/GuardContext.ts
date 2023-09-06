import {
  HttpRequest,
  HttpResponseWriter,
  HttpUser,
  httpRequestFactory,
  httpResponseWriterFactory,
} from "@/core";
import { Request, Response } from "express";

export interface GuardContext {
  readonly request: HttpRequest;
  readonly response: HttpResponseWriter;
  readonly user: HttpUser;
}

class GuardContextImpl implements GuardContext {
  constructor(
    readonly request: HttpRequest,
    readonly response: HttpResponseWriter,
    readonly user: HttpUser
  ) {}
}

export function guardContextFactory(req: Request, res: Response): GuardContext {
  const request = httpRequestFactory(req);
  const response = httpResponseWriterFactory(res);
  const user = req.user;
  return new GuardContextImpl(request, response, user);
}
