import { IRequestContext } from "./RequestContext";
import { IResponseWriter } from "./ResponseWriter";

export type Middleware = MiddlewareFunction;

export type MiddlewareFunction = (
  request: IRequestContext,
  response: IResponseWriter,
  next: () => Promise<void>
) => void | Promise<void>;

// TODO Create MiddlewareInstance type
