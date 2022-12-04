import { HttpContext } from "@/core";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { AsyncRequestHandler, RequestHandler } from "../../requests";

export abstract class RequestHandlerResolver {
  private constructor() {}

  static async resolveAndHandleAsync<
    TConstructor extends RequestHandler<TResponse> | AsyncRequestHandler<TResponse>,
    TResponse = void
  >(constructor: constructor<TConstructor>, context: HttpContext) {
    const instance = container.resolve(constructor) as
      | RequestHandler<TResponse>
      | AsyncRequestHandler<TResponse>;

    const requestHandler = instance as RequestHandler<TResponse>;

    const asyncRequestHandler = instance as AsyncRequestHandler<TResponse>;

    if (requestHandler.handle !== undefined) {
      return requestHandler.handle(context);
    }

    if (asyncRequestHandler.handleAsync !== undefined) {
      return await asyncRequestHandler.handleAsync(context);
    }

    throw new Error(
      `Could not convert provided request handler into a valid ${RequestHandler.name} or ${AsyncRequestHandler.name}.`
    );
  }
}
