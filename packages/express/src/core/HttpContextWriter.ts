import {
  HttpResponseWriter,
  HttpUserWriter,
  httpResponseWriterFactory,
  httpUserWriterFactory,
} from "@/core";
import { Request, Response } from "express";
import { HttpRequestWriter, httpRequestWriterFactory } from "./HttpRequestWriter";

export interface HttpContextWriter {
  readonly request: HttpRequestWriter;
  readonly response: HttpResponseWriter;
  readonly user: HttpUserWriter;
}

class HttpContextWriterImpl implements HttpContextWriter {
  constructor(
    readonly request: HttpRequestWriter,
    readonly response: HttpResponseWriter,
    readonly user: HttpUserWriter
  ) {}
}

export function httpContextWriterFactory(req: Request, res: Response): HttpContextWriter {
  const requestWriter = httpRequestWriterFactory(req);
  const responseWriter = httpResponseWriterFactory(res);
  const userWriter = httpUserWriterFactory(req.user);
  return new HttpContextWriterImpl(requestWriter, responseWriter, userWriter);
}
