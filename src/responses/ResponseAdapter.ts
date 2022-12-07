import { Response } from "express";
import { StatusCodes } from "@/core";
import { BaseResponse, JsonResponse, PlainTextResponse, StatusCodeResponse } from "@/responses";

export abstract class ResponseAdapter {
  private constructor() {}

  static fromThomasToExpress(
    expressResponse: Response,
    handlerResponse: undefined | BaseResponse | any
  ): Response {
    if (handlerResponse === undefined || handlerResponse === null) {
      return expressResponse.send();
    }

    if (handlerResponse instanceof BaseResponse) {
      const defaultStatusCode = StatusCodes.ok;

      if (handlerResponse instanceof JsonResponse) {
        return expressResponse
          .status(handlerResponse.status ?? defaultStatusCode)
          .json(handlerResponse.data)
          .send();
      }

      if (handlerResponse instanceof PlainTextResponse) {
        return expressResponse
          .status(handlerResponse.status ?? defaultStatusCode)
          .send(handlerResponse.data);
      }

      if (handlerResponse instanceof StatusCodeResponse) {
        return expressResponse.sendStatus(handlerResponse.status ?? defaultStatusCode);
      }
    }

    return expressResponse.send(handlerResponse);
  }
}
