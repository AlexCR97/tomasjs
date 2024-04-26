import { IRequestContext, IResponseWriter } from "@/server";

export type Middleware = (
  request: IRequestContext,
  response: IResponseWriter,
  next: () => Promise<void>
) => void | Promise<void>;
