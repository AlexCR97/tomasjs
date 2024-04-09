import { HttpBody, HttpMethod, HttpRequest, PlainHttpRequest } from "./HttpRequest";
import { HttpHeaders, PlainHttpHeaders } from "./HttpHeaders";
import { HttpResponse } from "./HttpResponse";
import {
  RequestInterceptor,
  RequestInterceptorResult,
  ResponseInterceptor,
  isRequestInterceptorFunction,
  isRequestInterceptorInstance,
  isResponseInterceptorFunction,
  isResponseInterceptorInstance,
} from "./Interceptor";
import { InvalidOperationError } from "@/errors";
import { JsonSerializationError } from "./JsonSerializationError";

interface IHttpClient {
  send(request: PlainHttpRequest): Promise<HttpResponse>;
  send(request: HttpRequest): Promise<HttpResponse>;
  send(method: HttpMethod, url: string, options?: HttpRequestOptions): Promise<HttpResponse>;

  sendJson<T>(request: PlainHttpRequest): Promise<T>;
  sendJson<T>(request: HttpRequest): Promise<T>;
  sendJson<T>(method: HttpMethod, url: string, options?: HttpRequestOptions): Promise<T>;

  /* #region Shorthands */

  get(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
  getJson<T>(url: string, options?: HttpRequestOptions): Promise<T>;

  post(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<HttpResponse>;
  postJson<T>(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<T>;

  put(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<HttpResponse>;
  putJson<T>(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<T>;

  patch(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<HttpResponse>;
  patchJson<T>(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<T>;

  delete(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
  deleteJson<T>(url: string, options?: HttpRequestOptions): Promise<T>;

  head(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;

  options(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;

  /* #endregion */
}

export type HttpRequestOptions = { headers?: HttpHeaders; body?: HttpBody };

// TODO Add logging to HttpClient

export class HttpClient implements IHttpClient {
  private readonly _baseUrl: string | null;
  private readonly _headers: PlainHttpHeaders | HttpHeaders | null;
  private readonly _requestInterceptor: RequestInterceptor | null;
  private readonly _responseInterceptor: ResponseInterceptor | null;

  constructor(options?: {
    baseUrl?: string;
    headers?: PlainHttpHeaders | HttpHeaders;
    requestInterceptor?: RequestInterceptor;
    responseInterceptor?: ResponseInterceptor;
  }) {
    this._baseUrl = options?.baseUrl ?? null;
    this._headers = options?.headers ?? null;
    this._requestInterceptor = options?.requestInterceptor ?? null;
    this._responseInterceptor = options?.responseInterceptor ?? null;
  }

  send(request: PlainHttpRequest): Promise<HttpResponse>;
  send(request: HttpRequest): Promise<HttpResponse>;
  send(method: HttpMethod, url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
  async send(...args: any[]): Promise<HttpResponse> {
    if (args.length === 1) {
      if (args[0] instanceof HttpRequest) {
        return await this.sendRequest(args[0].toPlain());
      } else {
        return await this.sendRequest(args[0]);
      }
    }

    if (args.length === 2 || args.length === 3) {
      const [method, url, options] = args;

      const request = new HttpRequest(method).withUrl(url);

      if (options?.body) {
        request.withBody(options.body);
      }

      if (options?.headers) {
        request.withHeaders(options.headers);
      }

      return await this.sendRequest(request.toPlain());
    }

    throw new InvalidOperationError();
  }

  sendJson<T>(request: PlainHttpRequest): Promise<T>;
  sendJson<T>(request: HttpRequest): Promise<T>;
  sendJson<T>(method: HttpMethod, url: string, options?: HttpRequestOptions): Promise<T>;
  async sendJson<T>(...args: any[]): Promise<T> {
    if (args.length === 1) {
      if (args[0] instanceof HttpRequest) {
        args[0].withHeaders((h) => h.add("Content-Type", "application/json"));
        const response = await this.send(args[0]);
        return await this.readJsonResponse<T>(response);
      } else {
        const plainHttpRequest: PlainHttpRequest = args[0];

        if (!plainHttpRequest.headers) {
          plainHttpRequest.headers = {};
        }

        plainHttpRequest.headers = {
          ...plainHttpRequest.headers,
          "Content-Type": "application/json",
        };

        const response = await this.sendRequest(plainHttpRequest);
        return await this.readJsonResponse<T>(response);
      }
    }

    if (args.length === 2 || args.length === 3) {
      const [method, url, options] = args;

      const request = new HttpRequest(method).withUrl(url);

      if (options?.body) {
        request.withBody(options.body);
      }

      if (options?.headers) {
        request
          .withHeaders(options.headers)
          .withHeaders((h) => h.add("Content-Type", "application/json"));
      }

      const response = await this.sendRequest(request.toPlain());
      return await this.readJsonResponse<T>(response);
    }

    throw new InvalidOperationError();
  }

  /* #region Shorthands */

  async get(url: string, options?: HttpRequestOptions): Promise<HttpResponse> {
    return await this.send("get", url, options);
  }

  async getJson<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return await this.sendJson<T>("get", url, options);
  }

  async post(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<HttpResponse> {
    if (!options) {
      options = {};
    }

    options.body = body;

    return await this.send("post", url, options);
  }

  async postJson<T>(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<T> {
    if (!options) {
      options = {};
    }

    options.body = body;

    return await this.sendJson<T>("post", url, options);
  }

  async put(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<HttpResponse> {
    if (!options) {
      options = {};
    }

    options.body = body;

    return await this.sendJson("put", url, options);
  }

  async putJson<T>(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<T> {
    if (!options) {
      options = {};
    }

    options.body = body;

    return await this.sendJson<T>("put", url, options);
  }

  async patch(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<HttpResponse> {
    if (!options) {
      options = {};
    }

    options.body = body;

    return await this.send("patch", url, options);
  }

  async patchJson<T>(url: string, body: HttpBody, options?: HttpRequestOptions): Promise<T> {
    if (!options) {
      options = {};
    }

    options.body = body;

    return await this.sendJson<T>("patch", url, options);
  }

  async delete(url: string, options?: HttpRequestOptions): Promise<HttpResponse> {
    return await this.send("delete", url, options);
  }

  async deleteJson<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return await this.sendJson<T>("delete", url, options);
  }

  async head(url: string, options?: HttpRequestOptions): Promise<HttpResponse> {
    return await this.send("head", url, options);
  }

  async options(url: string, options?: HttpRequestOptions): Promise<HttpResponse> {
    return await this.send("options", url, options);
  }

  /* #endregion */

  private async sendRequest(request: PlainHttpRequest): Promise<HttpResponse> {
    request = this.buildRequest(request);
    request = await this.interceptRequest(request, this._requestInterceptor);

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    return await this.interceptResponse(response, this._responseInterceptor);
  }

  private buildRequest(request: PlainHttpRequest): PlainHttpRequest {
    if (this._baseUrl) {
      request.url = this.buildUrl(this._baseUrl, request.url);
    }

    if (this._headers) {
      if (request.headers === undefined) {
        request.headers = {};
      }

      if (this._headers instanceof HttpHeaders) {
        const plainHeaders = this._headers.toPlain();
        request.headers = { ...request.headers, ...plainHeaders };
      } else {
        request.headers = { ...request.headers, ...this._headers };
      }
    }

    return request;
  }

  private buildUrl(baseUrl: string | null, url: string): string {
    const parts: string[] = [];

    if (
      baseUrl !== null &&
      baseUrl !== undefined &&
      baseUrl.trim().length > 0 &&
      baseUrl.trim() !== "/"
    ) {
      parts.push(baseUrl);
    }

    if (url !== null && url !== undefined && url.trim().length > 0 && url.trim() !== "/") {
      parts.push(url);
    }

    return parts.join("/");
  }

  private async interceptRequest(
    request: PlainHttpRequest,
    interceptor: RequestInterceptor | null
  ): Promise<PlainHttpRequest> {
    if (interceptor === null) {
      return request;
    }

    const httpRequest = HttpRequest.fromPlain(request);
    let result: RequestInterceptorResult;

    if (isRequestInterceptorFunction(interceptor)) {
      result = await interceptor(httpRequest);
    } else if (isRequestInterceptorInstance(interceptor)) {
      result = await interceptor.intercept(httpRequest);
    } else {
      throw new InvalidOperationError();
    }

    return result instanceof HttpRequest ? result.toPlain() : result;
  }

  private async interceptResponse(
    response: HttpResponse,
    interceptor: ResponseInterceptor | null
  ): Promise<HttpResponse> {
    if (interceptor === null) {
      return response;
    }

    if (isResponseInterceptorFunction(interceptor)) {
      return await interceptor(response);
    } else if (isResponseInterceptorInstance(interceptor)) {
      return await interceptor.intercept(response);
    } else {
      throw new InvalidOperationError();
    }
  }

  private async readJsonResponse<T>(response: HttpResponse): Promise<T> {
    if (!response.ok) {
      throw JsonSerializationError.cannotDeserialize(response);
    }

    const json = await response.json();

    return json as T;
  }
}
