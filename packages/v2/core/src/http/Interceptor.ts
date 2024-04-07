import { HttpRequest, PlainHttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";

export type RequestInterceptor = RequestInterceptorFunction | IRequestInterceptor;

export type RequestInterceptorFunction = (
  request: HttpRequest
) => Promise<RequestInterceptorResult>;

export type RequestInterceptorResult = HttpRequest | PlainHttpRequest;

export interface IRequestInterceptor {
  intercept(request: HttpRequest): Promise<RequestInterceptorResult>;
}

export function isRequestInterceptorFunction(obj: any): obj is RequestInterceptorFunction {
  if (obj === null || obj === undefined) {
    return false;
  }

  return typeof obj === "function" && (obj as Function).length === 1;
}

export function isRequestInterceptorInstance(obj: any): obj is IRequestInterceptor {
  if (obj === null || obj === undefined) {
    return false;
  }

  const func = (obj as IRequestInterceptor)["intercept"];

  if (func === null || func === undefined) {
    return false;
  }

  return (
    typeof func === "function" &&
    func.name === <keyof IRequestInterceptor>"intercept" &&
    func.length === 1
  );
}

export type ResponseInterceptor = ResponseInterceptorFunction | IResponseInterceptor;
export type ResponseInterceptorFunction = (response: HttpResponse) => Promise<HttpResponse>;
export interface IResponseInterceptor {
  intercept(response: HttpResponse): Promise<HttpResponse>;
}

export function isResponseInterceptorFunction(obj: any): obj is ResponseInterceptorFunction {
  if (obj === null || obj === undefined) {
    return false;
  }

  return typeof obj === "function" && (obj as Function).length === 1;
}

export function isResponseInterceptorInstance(obj: any): obj is IResponseInterceptor {
  if (obj === null || obj === undefined) {
    return false;
  }

  const func = (obj as IResponseInterceptor)["intercept"];

  if (func === null || func === undefined) {
    return false;
  }

  return (
    typeof func === "function" &&
    func.name === <keyof IResponseInterceptor>"intercept" &&
    func.length === 1
  );
}
