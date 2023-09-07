import { HttpResponseWriter, HttpUser, httpResponseWriterFactory } from "@/core";
import { Request, Response } from "express";
import { HttpRequestWriter, httpRequestWriterFactory } from "./HttpRequestWriter";

export interface HttpContextWriter {
  readonly request: HttpRequestWriter;
  readonly response: HttpResponseWriter;
  readonly user: HttpUser;
}

class HttpContextWriterImpl implements HttpContextWriter {
  constructor(
    readonly request: HttpRequestWriter,
    readonly response: HttpResponseWriter,
    readonly user: HttpUser
  ) {}
}

export function httpContextWriterFactory(req: Request, res: Response): HttpContextWriter {
  const requestWriter = httpRequestWriterFactory(req);
  const responseWriter = httpResponseWriterFactory(res);
  const user = req.user;
  return new HttpContextWriterImpl(requestWriter, responseWriter, user);
}
