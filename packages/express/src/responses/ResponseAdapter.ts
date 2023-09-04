import { Response } from "express";
import { statusCodes } from "@/core";
import { BaseResponse, JsonResponse, PlainTextResponse, StatusCodeResponse } from "@/responses";
import { Logger } from "@tomasjs/core";

export abstract class ResponseAdapter {
  private constructor() {}

  static fromThomasToExpress(
    expressResponse: Response,
    handlerResponse: undefined | BaseResponse | any,
    options?: { logger?: Logger }
  ): Response {
    const logger = options?.logger;

    if (handlerResponse === undefined || handlerResponse === null) {
      logger?.debug("The handlerResponse is null.");
      return expressResponse.send();
    }

    if (handlerResponse instanceof BaseResponse) {
      const defaultStatusCode = statusCodes.ok;

      if (handlerResponse instanceof JsonResponse) {
        logger?.debug("The handlerResponse is a JsonResponse.");
        return expressResponse
          .status(handlerResponse.status ?? defaultStatusCode)
          .json(handlerResponse.data)
          .send();
      }

      if (handlerResponse instanceof PlainTextResponse) {
        logger?.debug("The handlerResponse is a PlainTextResponse.");
        return expressResponse
          .status(handlerResponse.status ?? defaultStatusCode)
          .send(handlerResponse.data);
      }

      if (handlerResponse instanceof StatusCodeResponse) {
        logger?.debug("The handlerResponse is a StatusCodeResponse.");
        return expressResponse.sendStatus(handlerResponse.status ?? defaultStatusCode);
      }
    }

    logger?.debug("The handlerResponse did not match any known type.");
    return expressResponse.send(handlerResponse);
  }
}
