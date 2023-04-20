import { ClassConstructor } from "@tomasjs/core";
import { Middleware } from "./Middleware";
import { MiddlewareHandler } from "./MiddlewareHandler";

export type MiddlewareFactoryHandler<TMiddleware extends Middleware = Middleware> = () =>
  | MiddlewareHandler
  | TMiddleware
  | ClassConstructor<TMiddleware>;

export function isMiddlewareFactoryHandler<TMiddleware extends Middleware = Middleware>(
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
