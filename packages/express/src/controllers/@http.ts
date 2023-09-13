import { HttpMethod } from "@/core";
import { Request, Response } from "express";
import { BodyMetadataKey } from "./@body";
import { HeaderMetadata, HeaderMetadataKey } from "./@header";
import { HeadersMetadataKey } from "./@headers";
import { ParamMetadata, ParamMetadataKey } from "./@param";
import { QueryMetadata, QueryMetadataKey } from "./@query";
import { HttpMethodMetadata } from "./metadata";
import { RequiredArgumentError, TomasError } from "@tomasjs/core";
import { MiddlewareType } from "@/middleware";
import { GuardType } from "@/guards";
import { TransformResultResolver } from "@/transforms";
import { FileMetadata, fileMetadataKey } from "./@file";
import { FormFile } from "./FormFile";
import { filesMetadataKey } from "./@files";
import { FormFilesBuilder } from "./FormFilesBuilder";
import { UploadedFile } from "express-fileupload";
import { UseFilesError } from "./UseFilesError";
import { InterceptorType } from "@/interceptors";

interface HttpOptions {
  middlewares?: MiddlewareType[];
  interceptors?: InterceptorType[];
  guards?: GuardType[];
}

export function http(method: HttpMethod, path?: string, options?: HttpOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = new HttpMethodMetadata(target, propertyKey);
    metadata.instanceMethod = propertyKey;
    metadata.httpMethod = method;
    metadata.path = path;
    metadata.addMiddleware(...(options?.middlewares ?? []));
    metadata.addInterceptor(...(options?.interceptors ?? []));
    metadata.addGuard(...(options?.guards ?? []));

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
      tryInjectFilesArg();
      tryInjectFileArgs();

      return originalFunction.apply(this, controllerMethodArgs);

      function tryInjectHeadersArg() {
        const paramIndex = Reflect.getOwnMetadata(HeadersMetadataKey, target, propertyKey);

        if (typeof paramIndex !== "number") {
          return;
        }

        controllerMethodArgs[paramIndex] = req.headers;
      }

      function tryInjectHeaderArgs() {
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
        const paramMetadata: ParamMetadata = Reflect.getOwnMetadata(
          ParamMetadataKey,
          target,
          propertyKey
        );

        if (!paramMetadata) {
          return;
        }

        if (paramMetadata.transform) {
          req.params[paramMetadata.paramKey] = new TransformResultResolver(
            paramMetadata.transform
          ).resolve(req.params[paramMetadata.paramKey]);
        }

        controllerMethodArgs[paramMetadata.parameterIndex] = req.params[paramMetadata.paramKey];
      }

      function tryInjectQueryArgs() {
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
        const paramIndex = Reflect.getOwnMetadata(BodyMetadataKey, target, propertyKey);

        if (typeof paramIndex !== "number") {
          return;
        }

        controllerMethodArgs[paramIndex] = req.body;
      }

      function tryInjectFilesArg() {
        const paramIndex = Reflect.getOwnMetadata(filesMetadataKey, target, propertyKey);

        if (typeof paramIndex !== "number") {
          return;
        }

        if (req.files === undefined || req.files === null) {
          throw new UseFilesError();
        }

        const formFilesBuilder = new FormFilesBuilder();

        for (const formField of Object.keys(req.files)) {
          const file = req.files[formField];
          const formFile = toFormFileOrFormFileArray(file);
          formFilesBuilder.with(formField, formFile);
        }

        controllerMethodArgs[paramIndex] = formFilesBuilder.build();
      }

      function tryInjectFileArgs() {
        const fileMetadatas: FileMetadata[] | undefined | null = Reflect.getOwnMetadata(
          fileMetadataKey,
          target,
          propertyKey
        );

        if (fileMetadatas === undefined || fileMetadatas === null || fileMetadatas.length === 0) {
          return;
        }

        if (req.files === undefined || req.files === null) {
          throw new UseFilesError();
        }

        for (const { parameterIndex, formField } of fileMetadatas) {
          const file = req.files[formField];

          if (Array.isArray(file)) {
            throw new TomasError(
              "Cannot bind FormFile array with @file decorator. Please use @files decorator instead."
            );
          }

          controllerMethodArgs[parameterIndex] = toFormFile(file);
        }
      }

      function toFormFile(file: UploadedFile): FormFile {
        return new FormFile(
          file.name,
          file.encoding,
          file.mimetype,
          file.data,
          file.truncated,
          file.size,
          file.md5
        );
      }

      function toFormFileOrFormFileArray(
        fileOrFileArray: UploadedFile | UploadedFile[]
      ): FormFile | FormFile[] {
        return Array.isArray(fileOrFileArray)
          ? fileOrFileArray.map((x) => toFormFile(x))
          : toFormFile(fileOrFileArray);
      }
    };

    return descriptor;
  };
}

export function httpGet(path?: string, options?: HttpOptions) {
  return http("get", path, options);
}

export function httpPost(path?: string, options?: HttpOptions) {
  return http("post", path, options);
}

export function httpPut(path?: string, options?: HttpOptions) {
  return http("put", path, options);
}

export function httpPatch(path?: string, options?: HttpOptions) {
  return http("patch", path, options);
}

export function httpDelete(path?: string, options?: HttpOptions) {
  return http("delete", path, options);
}
