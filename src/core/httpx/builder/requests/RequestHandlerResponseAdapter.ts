import { Response as ExpressResponse } from "express";
import { BaseResponse, JsonResponse, PlainTextResponse, StatusCodeResponse } from "../../responses";
import { StatusCodes } from "../../StatusCodes";

export abstract class RequestHandlerResponseAdapter {
  private constructor() {}

  static toExpressResponse(
    expressResponse: ExpressResponse,
    handlerResponse: undefined | BaseResponse | any
  ): ExpressResponse {
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
