import { Response } from "express";
import { httpResponseFactory } from "./HttpResponse";

export interface HttpResponseWriter {
  /* #region Headers */
  setHeader(key: string, value: string | string[]): HttpResponseWriter;
  removeHeader(key: string): HttpResponseWriter;
  /* #endregion */
}

export function httpResponseWriterFactory(res: Response): HttpResponseWriter {
  return httpResponseFactory(res);
}
