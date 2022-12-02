import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { AsyncRequestHandler, RequestContext, RequestHandler } from "../../requests";

export abstract class RequestHandlerResolver {
  private constructor() {}

  static async resolveAndHandleAsync<
    TConstructor extends RequestHandler<TResponse> | AsyncRequestHandler<TResponse>,
    TResponse = void
  >(constructor: constructor<TConstructor>, requestContext: RequestContext) {
    const instance = container.resolve(constructor) as
      | RequestHandler<TResponse>
      | AsyncRequestHandler<TResponse>;

    const requestHandler = instance as RequestHandler<TResponse>;

    const asyncRequestHandler = instance as AsyncRequestHandler<TResponse>;

    if (requestHandler.handle !== undefined) {
      return requestHandler.handle(requestContext);
    }

    if (asyncRequestHandler.handleAsync !== undefined) {
      return await asyncRequestHandler.handleAsync(requestContext);
    }

    throw new Error(
      `Could not convert provided request handler into a valid ${RequestHandler.name} or ${AsyncRequestHandler.name}.`
    );
  }
}
