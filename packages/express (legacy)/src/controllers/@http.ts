import { HttpMethod } from "@/core";
import { RequiredArgumentError } from "@/core/errors";
import { Request, Response } from "express";
import { BodyMetadataKey } from "./@body";
import { HeaderMetadata, HeaderMetadataKey } from "./@header";
import { HeadersMetadataKey } from "./@headers";
import { ParamMetadata, ParamMetadataKey } from "./@param";
import { QueryMetadata, QueryMetadataKey } from "./@query";
import { HttpMethodMetadata } from "./metadata";

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

      tryInjectHeadersArg();
      tryInjectHeaderArgs();
      tryInjectParamsArg();
      tryInjectQueryArgs();
      tryInjectBodyArg();

      return originalFunction.apply(this, controllerMethodArgs);

      function tryInjectHeadersArg() {
        //@ts-ignore: The package "reflect-metadata" should be imported by host
        const paramIndex = Reflect.getOwnMetadata(HeadersMetadataKey, target, propertyKey);

        if (typeof paramIndex !== "number") {
          return;
        }

        controllerMethodArgs[paramIndex] = req.headers;
      }

      function tryInjectHeaderArgs() {
        //@ts-ignore: The package "reflect-metadata" should be imported by host
        const headerMetadatas: HeaderMetadata[] = Reflect.getOwnMetadata(
          HeaderMetadataKey,
          target,
          propertyKey
        );

        if (!headerMetadatas || headerMetadatas.length === 0) {
          return;
        }

        for (const { parameterIndex, key } of headerMetadatas) {
          controllerMethodArgs[parameterIndex] = req.headers[key];
        }
      }

      function tryInjectParamsArg() {
        //@ts-ignore: The package "reflect-metadata" should be imported by host
        const paramMetadata: ParamMetadata = Reflect.getOwnMetadata(
          ParamMetadataKey,
          target,
          propertyKey
        );

        if (!paramMetadata) {
          return;
        }

        controllerMethodArgs[paramMetadata.parameterIndex] = req.params[paramMetadata.paramKey];
      }

      function tryInjectQueryArgs() {
        //@ts-ignore: The package "reflect-metadata" should be imported by host
        const queryMetadatas: QueryMetadata[] = Reflect.getOwnMetadata(
          QueryMetadataKey,
          target,
          propertyKey
        );

        if (!queryMetadatas || queryMetadatas.length === 0) {
          return;
        }

        for (const queryMetadata of queryMetadatas) {
          if (queryMetadata.key) {
            controllerMethodArgs[queryMetadata.parameterIndex] = req.query[queryMetadata.key];
          } else {
            controllerMethodArgs[queryMetadata.parameterIndex] = req.query;
          }
        }
      }

      function tryInjectBodyArg() {
        //@ts-ignore: The package "reflect-metadata" should be imported by host
        const paramIndex = Reflect.getOwnMetadata(BodyMetadataKey, target, propertyKey);

        if (typeof paramIndex !== "number") {
          return;
        }

        controllerMethodArgs[paramIndex] = req.body;
      }
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
