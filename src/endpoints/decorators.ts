import { HttpMethod } from "@/core";

const MethodKey = "__endpoint__method";
const PathKey = "__endpoint__path";

export function Endpoint(method: HttpMethod, path: string = "/") {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    console.log("Endpoint!", constructor);
    return class extends constructor {
      constructor(...args: any[]) {
        super();
        (this as any)[MethodKey] = method;
        (this as any)[PathKey] = path;
      }
    };
  };
}

const ContextParameterKey = "__param__context";

export function Context() {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    console.log("Context!", { target, propertyKey, parameterIndex });
  };
}
