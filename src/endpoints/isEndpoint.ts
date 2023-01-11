import { Endpoint } from "./Endpoint";

export function isEndpoint(obj: any): obj is Endpoint {
  if (obj === undefined || obj === null) {
    return false;
  }

  const func = obj.handle as Function;

  if (typeof func !== "function") {
    return false;
  }

  // Considering that the "handle" must be a named function...
  return (
    func.name.trim() === "handle" && // The name must be "handle"
    func.prototype === undefined && // The prototype must be undefined
    func.length === 1 // It must receive 1 argument
  );
}
