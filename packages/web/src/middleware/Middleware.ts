import { IRequestContext, IResponseWriter } from "@/server";

export type MiddlewareFunction = (
  request: IRequestContext,
  response: IResponseWriter,
  next: () => Promise<void>
) => void | Promise<void>;
