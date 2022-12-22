import { ErrorMiddleware } from "./ErrorMiddleware";

export function isErrorMiddleware(obj: any): obj is ErrorMiddleware {
  if (obj === undefined || obj === null) {
    return false;
  }

  const func = obj.handle as Function;

  if (typeof func !== "function") {
    return false;
  }

  // Considering that "handle" must be a named function...
  return (
    func.name.trim() === "handle" && // The name must be "handle"
    func.prototype === undefined && // The prototype must be undefined
    func.length === 3 // It must receive 3 arguments
  );
}
