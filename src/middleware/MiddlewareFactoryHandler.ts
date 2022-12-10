import { constructor } from "tsyringe/dist/typings/types";
import { ThomasMiddleware } from "./Middleware";
import { ThomasMiddlewareHandler } from "./types";

export type MiddlewareFactoryHandler<TMiddleware extends ThomasMiddleware = ThomasMiddleware> =
  () => ThomasMiddlewareHandler | TMiddleware | constructor<TMiddleware>;

export function isMiddlewareFactoryHandler<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
  obj: any
): obj is MiddlewareFactoryHandler<TMiddleware> {
  if (typeof obj !== "function") {
    return false;
  }

  const func = obj as Function;

  // Considering that a MiddlewareFactoryHandler must be anonymous function...
  return (
    func.prototype === undefined && // The prototype must be undefined
    func.length === 0 && // It must receive 0 arguments
    func.toString().includes("=>") // It must be an arrow function
  );
}
