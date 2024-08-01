import {
  request as sendHttpRequest,
  IncomingMessage,
  RequestOptions,
  OutgoingHttpHeader,
  OutgoingHttpHeaders,
  ClientRequest,
  IncomingHttpHeaders,
} from "node:http";
import { request as sendHttpsRequest } from "node:https";
import { InvalidOperationError } from "@/errors";
import { ILogger, NullLogger } from "@/logging";
import {
  HttpContentFactory,
  HttpContentType,
  IHttpContent,
  isJsonContent,
  JsonRecord,
} from "./HttpContent";
import {
  HttpHeaders,
  HttpHeaderValue,
  IHttpHeaders,
  isIHttpHeaders,
  PlainHttpHeaders,
} from "./HttpHeaders";
import { HttpMethod, isHttpMethod } from "./HttpMethod";
import { HttpRequest, HttpRequestError, IHttpRequest } from "./HttpRequest";
import { HttpResponse, IHttpResponse } from "./HttpResponse";
import { readToBuffer } from "@/system/streams";
import { JsonResponseError } from "./JsonResponseError";
import { pipe } from "@/system";

export type IHttpClient = IHttpClientMethods & IHttpClientMethodsJson;

type IHttpClientMethods = {
  send<TResponse, TRequest = unknown>(
    request: IHttpRequest<TRequest>
  ): Promise<IHttpResponse<TResponse>>;
  send<TResponse, TRequest = unknown>(
    method: HttpMethod,
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>>;

  get<TResponse, TRequest>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>>;

  post<TResponse, TRequest>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>>;

  put<TResponse, TRequest>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>>;

  patch<TResponse, TRequest>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>>;

  delete<TResponse, TRequest>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>>;

  head<TResponse, TRequest>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>>;

  options<TResponse, TRequest>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>>;
};

type IHttpClientMethodsJson = {
  sendJson<TResponse extends JsonRecord, TRequest = unknown>(
    request: IHttpRequest<TRequest>
  ): Promise<TResponse>;
  sendJson<TResponse extends JsonRecord, TRequest = unknown>(
    method: HttpMethod,
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse>;

  getJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse>;

  postJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse>;

  putJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse>;

  patchJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse>;

  deleteJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse>;
};

export type HttpRequestOptions<TRequest> = {
  headers?: IHttpHeaders | PlainHttpHeaders;
  body?: IHttpContent<TRequest>;
};

export class HttpClient implements IHttpClient {
  private readonly baseUrl: string | undefined;
  private readonly defaultHeaders: IHttpHeaders | PlainHttpHeaders | undefined;
  private readonly logger: ILogger;

  constructor(options?: {
    baseUrl?: string;
    headers?: IHttpHeaders | PlainHttpHeaders;
    logger?: ILogger;
  }) {
    this.baseUrl = options?.baseUrl;
    this.defaultHeaders = options?.headers;
    this.logger = options?.logger ?? new NullLogger();
  }

  /* #region IHttpClientMethods */

  send<TResponse, TRequest>(request: IHttpRequest<TRequest>): Promise<IHttpResponse<TResponse>>;
  send<TResponse, TRequest>(
    method: HttpMethod,
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>>;
  async send<TResponse>(...args: any[]): Promise<IHttpResponse<TResponse>> {
    if (args.length === 1) {
      return await this._send(args[0]);
    }

    if (args.length === 2 || args.length === 3) {
      const method: HttpMethod = args[0];
      const url: string = args[1];
      const options: HttpRequestOptions<TResponse> | undefined = args[2];
      const requestBuilder = HttpRequest.builder().withMethod(method).withUrl(url);

      if (options) {
        if (options.headers) {
          requestBuilder.withHeaders(options.headers);
        }

        if (options.body) {
          requestBuilder.withBody(options.body);
        }
      }

      return await this._send(requestBuilder.build());
    }

    throw new InvalidOperationError();
  }

  private async _send<TResponse, TRequest>(
    request: IHttpRequest<TRequest>
  ): Promise<IHttpResponse<TResponse>> {
    try {
      this.logger.debug("Sending HTTP request:\n{request}", { request: request.toString() });

      const response = await this.sendRequest(request);

      const httpResponse = await toHttpResponse<TResponse, TRequest>(response, request);

      this.logger.debug("Received HTTP response:\n{response}", {
        response: httpResponse.toString(),
      });

      return httpResponse;
    } catch (err) {
      throw HttpRequestError.from<TRequest>(request, err);
    }

    async function toHttpResponse<TResponse, TRequest>(
      res: IncomingMessage,
      req: IHttpRequest<TRequest>
    ): Promise<IHttpResponse<TResponse>> {
      return new HttpResponse<TResponse>(
        res.httpVersion,
        toHttpMethod(res.method ?? req.method),
        toUrl(res, req),
        toPlainHttpHeaders(res.headers),
        res.statusCode ?? 0,
        res.statusMessage ?? "",
        await toHttpContent(res)
      );

      function toHttpMethod(method: string | undefined): HttpMethod {
        if (isHttpMethod(method)) {
          return method;
        }

        if (typeof method === "string") {
          const normalizedMethod = method.trim().toUpperCase();

          if (isHttpMethod(normalizedMethod)) {
            return normalizedMethod;
          }
        }

        throw new InvalidOperationError();
      }

      function toUrl<T>(res: IncomingMessage, req: IHttpRequest<T>): string {
        if (res.url !== undefined && res.url !== null && res.url.trim().length > 0) {
          return res.url;
        }

        return req.url;
      }

      function toPlainHttpHeaders(incomingHttpHeaders: IncomingHttpHeaders): PlainHttpHeaders {
        const headers = new HttpHeaders();

        for (const headerKey in incomingHttpHeaders) {
          const headerValue = incomingHttpHeaders[headerKey];

          if (headerValue) {
            headers.add(headerKey, headerValue);
          }
        }

        return headers.toPlain();
      }

      async function toHttpContent<T>(res: IncomingMessage): Promise<IHttpContent<T>> {
        const contentType: HttpContentType = res.headers["content-type"] ?? "Unknown";
        const data = await readToBuffer(res);
        return HttpContentFactory.from(contentType, data) as IHttpContent<T>;
      }
    }
  }

  private sendRequest<TRequest>(request: IHttpRequest<TRequest>): Promise<IncomingMessage> {
    return new Promise<IncomingMessage>((resolve, reject) => {
      let res: IncomingMessage;

      const url = buildUrl(this.baseUrl, request.url);

      const clientRequest = sendRequest(url, {
        method: request.method,
        headers: buildHeaders(request, { defaultHeaders: this.defaultHeaders }),
      });

      if (request.body) {
        clientRequest.write(request.body.data);
      }

      clientRequest.on("socket", () => {
        this.logger.verbose("Socket opened");
      });

      clientRequest.on("response", ($res) => {
        this.logger.verbose("Response received");
        res = $res;
      });

      clientRequest.on("error", (err) => {
        this.logger.verbose("An error occurred. {errorName}: {errorMessage}", {
          errorName: err.name,
          errorMessage: err.message,
        });

        return reject(err);
      });

      clientRequest.on("close", () => {
        this.logger.verbose("Connection closed");
        return resolve(res);
      });

      clientRequest.end();

      function buildUrl(baseUrl: string | undefined, resourceUrl: string): string {
        const parts: string[] = [];

        if (
          baseUrl !== null &&
          baseUrl !== undefined &&
          baseUrl.trim().length > 0 &&
          baseUrl.trim() !== "/"
        ) {
          parts.push(baseUrl);
        }

        if (
          resourceUrl !== null &&
          resourceUrl !== undefined &&
          resourceUrl.trim().length > 0 &&
          resourceUrl.trim() !== "/"
        ) {
          parts.push(resourceUrl);
        }

        return parts.map((part) => trim(part, "/")).join("/");

        function trim(str: string, char: string): string {
          return pipe(str)
            .pipe((str) => (str.startsWith(char) ? str.slice(1) : str))
            .pipe((str) => (str.endsWith(char) ? str.slice(0, str.length - 1) : str))
            .get();
        }
      }

      function sendRequest(url: string, options: RequestOptions): ClientRequest {
        return url.includes("https")
          ? sendHttpsRequest(url, options)
          : sendHttpRequest(url, options);
      }

      function buildHeaders<T>(
        request: IHttpRequest<T>,
        options: { defaultHeaders: IHttpHeaders | PlainHttpHeaders | undefined }
      ): OutgoingHttpHeaders {
        let headers: OutgoingHttpHeaders = {};

        if (options?.defaultHeaders) {
          const defaultHeaders = isIHttpHeaders(options.defaultHeaders)
            ? options.defaultHeaders
            : HttpHeaders.fromPlain(options.defaultHeaders);

          headers = { ...headers, ...toOutgoingHttpHeaders(defaultHeaders) };
        }

        if (request.headers) {
          headers = { ...headers, ...toOutgoingHttpHeaders(request.headers) };
        }

        if (request.body) {
          headers = withContentLength(headers, request.body);
        }

        return headers;

        function toOutgoingHttpHeaders(headers: IHttpHeaders): OutgoingHttpHeaders {
          const outgoingHttpHeaders: OutgoingHttpHeaders = {};
          const plainHeaders = headers.toPlain();

          for (const headerKey in plainHeaders) {
            const headerValue = plainHeaders[headerKey];
            outgoingHttpHeaders[headerKey] = toOutgoingHttpHeader(headerValue);
          }

          return outgoingHttpHeaders;

          function toOutgoingHttpHeader(headerValue: HttpHeaderValue): OutgoingHttpHeader {
            if (typeof headerValue === "string") {
              return headerValue;
            }

            return [...headerValue];
          }
        }

        function withContentLength<T>(
          headers: OutgoingHttpHeaders,
          body: IHttpContent<T>
        ): OutgoingHttpHeaders {
          const newHeaders: OutgoingHttpHeaders = { ...headers };
          const contentLength = Buffer.byteLength(body.data);
          newHeaders["content-length"] = contentLength;
          return newHeaders;
        }
      }
    });
  }

  get<TResponse, TRequest>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>> {
    return this.send("GET", url, options);
  }

  post<TResponse, TRequest>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>> {
    return this.send("POST", url, { ...options, body });
  }

  put<TResponse, TRequest>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>> {
    return this.send("PUT", url, { ...options, body });
  }

  patch<TResponse, TRequest>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>> {
    return this.send("PATCH", url, { ...options, body });
  }

  delete<TResponse, TRequest>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>> {
    return this.send("DELETE", url, options);
  }

  head<TResponse, TRequest>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>> {
    return this.send("HEAD", url, options);
  }

  options<TResponse, TRequest>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<IHttpResponse<TResponse>> {
    return this.send("OPTIONS", url, options);
  }

  /* #endregion */

  /* #region IHttpClientMethodsJson */

  sendJson<TResponse extends JsonRecord, TRequest = unknown>(
    request: IHttpRequest<TRequest>
  ): Promise<TResponse>;
  sendJson<TResponse extends JsonRecord, TRequest = unknown>(
    method: HttpMethod,
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse>;
  async sendJson<TResponse extends JsonRecord, TRequest>(...args: any[]): Promise<TResponse> {
    const response = await getResponse(this, args);

    if (isJsonContent<TResponse>(response.body)) {
      return response.body.readData();
    }

    throw new JsonResponseError(response);

    async function getResponse<TResponse, TRequest>(
      thiz: HttpClient,
      args: any[]
    ): Promise<IHttpResponse<TResponse>> {
      if (args.length === 1) {
        const request: IHttpRequest<TRequest> = args[0];
        return await thiz.send(request);
      }

      if (args.length === 2 || args.length === 3) {
        const method: HttpMethod = args[0];
        const url: string = args[1];
        const options: HttpRequestOptions<TRequest> | undefined = args[2];
        return await thiz.send(method, url, options);
      }

      throw new InvalidOperationError();
    }
  }

  getJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse> {
    return this.sendJson("GET", url, options);
  }

  postJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse> {
    return this.sendJson("POST", url, { ...options, body });
  }

  putJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse> {
    return this.sendJson("PUT", url, { ...options, body });
  }

  patchJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    body: IHttpContent<TRequest>,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse> {
    return this.sendJson("PATCH", url, { ...options, body });
  }

  deleteJson<TResponse extends JsonRecord, TRequest = unknown>(
    url: string,
    options?: HttpRequestOptions<TRequest>
  ): Promise<TResponse> {
    return this.sendJson("DELETE", url, options);
  }

  /* #endregion */
}
