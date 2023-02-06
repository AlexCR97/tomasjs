import { HttpMethod } from "@/core";
import { RequiredArgumentError } from "@/core/errors";
import { Request, Response } from "express";
import { BodyMetadataKey } from "./@body";
import { ParamMetadata, ParamMetadataKey } from "./@param";
import { HttpMethodMetadata } from "./metadata";

// The following snippet was extracted from: https://stackoverflow.com/questions/68919313/add-metadata-to-method-in-typescript
// you add the args that will be needed in the function
// export function name(data: any) {
//   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     Reflect.defineMetadata(
//       // this here is to reference the data later when we retrieve it.
//       propertyKey,
//       {
//         // we put this spread operator in case you have decorated already, so
//         // we dont want to lose the old data
//         ...Reflect.getMetadata(propertyKey, target),
//         // then we append whatever else we need
//         name: data,
//       },
//       target
//     );
//     return descriptor;
//   };
// }

export function http(method: HttpMethod, path?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = new HttpMethodMetadata(target, propertyKey);
    metadata.instanceMethod = propertyKey;
    metadata.httpMethod = method;
    metadata.path = path;

    const originalFunction: Function = descriptor.value;

    descriptor.value = async function (req: Request, res: Response) {
      RequiredArgumentError.throw(req, "req");
      RequiredArgumentError.throw(res, "res");

      const controllerMethodArgs: any[] = [];

      // Try inject body
      const bodyParamIndex = Reflect.getOwnMetadata(BodyMetadataKey, target, propertyKey);
      if (typeof bodyParamIndex === "number") {
        controllerMethodArgs[bodyParamIndex] = req.body;
      }

      // Try inject param
      const paramMetadata: ParamMetadata = Reflect.getOwnMetadata(
        ParamMetadataKey,
        target,
        propertyKey
      );
      if (paramMetadata) {
        controllerMethodArgs[paramMetadata.parameterIndex] = req.params[paramMetadata.paramKey];
      }

      // console.log("controllerMethodArgs", controllerMethodArgs);

      return originalFunction.apply(this, controllerMethodArgs);
    };

    return descriptor;
  };
}

export function get(path?: string) {
  return http("get", path);
}

export function post(path?: string) {
  return http("post", path);
}

export function put(path?: string) {
  return http("put", path);
}

export function patch(path?: string) {
  return http("patch", path);
}
