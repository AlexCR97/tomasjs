import { HttpContext } from "@/core";

export type EndpointHandler<TResponse> = (context: HttpContext) => TResponse | Promise<TResponse>;

export function IsEndpointHandler<TResponse>(obj: any): obj is EndpointHandler<TResponse> {
  if (typeof obj !== "function") {
    return false;
  }

  const func = obj as Function;

  // Considering that an EndpointHandler must be anonymous function...
  return (
    func.name.trim().length === 0 && // The name must be an empty string
    func.prototype === undefined && // The prototype must be undefined
    func.length === 0 && // It must receive 1 argument
    func.toString().includes("=>") // It must be an arrow function
  );
}
