import {
  HttpRequest,
  HttpResponse,
  HttpUser,
  httpRequestFactory,
  httpResponseFactory,
} from "@/core";
import { Request, Response } from "express";

export interface GuardContext {
  readonly request: HttpRequest;
  readonly response: HttpResponse;
  readonly user: HttpUser;
}

class GuardContextImpl implements GuardContext {
  constructor(
    readonly request: HttpRequest,
    readonly response: HttpResponse,
    readonly user: HttpUser
  ) {}
}

export function guardContextFactory(req: Request, res: Response): GuardContext {
  const request = httpRequestFactory(req);
  const response = httpResponseFactory(res);
  const user = req.user;
  return new GuardContextImpl(request, response, user);
}
