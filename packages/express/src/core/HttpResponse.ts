import { Logger, TomasError, TomasLogger } from "@tomasjs/core";
import {
  BaseResponse,
  FileResponse,
  JsonResponse,
  PlainTextResponse,
  StatusCodeResponse,
} from "@/responses";
import { Response } from "express";
import { statusCodes } from "./statusCodes";

export interface HttpResponse {
  /* #region Headers */
  setHeader(key: string, value: string | string[]): HttpResponse;
  removeHeader(key: string): HttpResponse;
  /* #endregion */

  send(response?: any): void;
}

class HttpResponseImpl implements HttpResponse {
  private readonly logger: Logger = new TomasLogger("HttpResponseWriter", "error");
  private readonly defaultStatusCode = statusCodes.ok;

  constructor(private readonly res: Response) {}

  /* #region Headers */

  setHeader(key: string, value: string | string[]): HttpResponse {
    this.res.setHeader(key, value);
    return this;
  }

  removeHeader(key: string): HttpResponse {
    this.res.removeHeader(key);
    return this;
  }

  /* #endregion */

  send(response?: any): void {
    if (response === undefined || response === null) {
      return this.sendEmptyResponse();
    }

    if (response instanceof BaseResponse) {
      return this.sendBaseResponse(response);
    }

    return this.sendRawResponse(response);
  }

  private sendEmptyResponse(): void {
    this.logger.debug("The response is empty");
    this.res.send();
  }

  private sendBaseResponse(response: BaseResponse): void {
    if (response instanceof FileResponse) {
      return this.sendFileResponse(response);
    }

    if (response instanceof JsonResponse) {
      return this.sendJsonResponse(response);
    }

    if (response instanceof PlainTextResponse) {
      return this.sendPlainTextResponse(response);
    }

    if (response instanceof StatusCodeResponse) {
      return this.sendStatusCodeResponse(response);
    }

    throw new TomasError("Unknown BaseResponse type", { data: { response } });
  }

  private sendFileResponse(response: FileResponse): void {
    this.logger.debug("The response is a FileResponse");

    this.res.status(response.status ?? this.defaultStatusCode).sendFile(response.path);
  }

  private sendJsonResponse(response: JsonResponse): void {
    this.logger.debug("The response is a JsonResponse");

    this.res
      .status(response.status ?? this.defaultStatusCode)
      .json(response.data)
      .send();
  }

  private sendPlainTextResponse(response: PlainTextResponse): void {
    this.logger.debug("The response is a PlainTextResponse");
    this.res.status(response.status ?? this.defaultStatusCode).send(response.data);
  }

  private sendStatusCodeResponse(response: StatusCodeResponse): void {
    this.logger.debug("The response is a StatusCodeResponse");
    this.res.sendStatus(response.status ?? this.defaultStatusCode);
  }

  private sendRawResponse(response: any): void {
    this.logger.debug("The response did not match any known type.");
    this.res.send(response);
  }
}

export function httpResponseFactory(res: Response): HttpResponse {
  return new HttpResponseImpl(res);
}
