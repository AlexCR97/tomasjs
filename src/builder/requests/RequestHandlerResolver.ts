import { HttpContext } from "@/core";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { RequestHandler } from "../../requests";

export abstract class RequestHandlerResolver {
  private constructor() {}

  static async handleAsync<TRequestHandler extends RequestHandler<any>>(
    requestHandler: TRequestHandler,
    context: HttpContext
  ) {
    if (requestHandler.handle !== undefined) {
      return await requestHandler.handle(context);
    }

    throw new Error(
      `Could not convert provided request handler into a valid ${RequestHandler.name}.`
    );
  }

  static async resolveAndHandleAsync<TRequestHandler extends RequestHandler<any>>(
    constructor: constructor<TRequestHandler>,
    context: HttpContext
  ) {
    const requestHandler = container.resolve(constructor);
    return await this.handleAsync(requestHandler, context);
  }
}
