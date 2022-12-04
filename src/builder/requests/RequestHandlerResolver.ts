import { HttpContext } from "@/core";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { RequestHandler } from "../../requests";

export abstract class RequestHandlerResolver {
  private constructor() {}

  static async resolveAndHandleAsync<
    TConstructor extends RequestHandler<TResponse>,
    TResponse = void
  >(constructor: constructor<TConstructor>, context: HttpContext) {
    const instance = container.resolve(constructor) as RequestHandler<TResponse>;
    const requestHandler = instance as RequestHandler<TResponse>;

    if (requestHandler.handle !== undefined) {
      return requestHandler.handle(context);
    }

    throw new Error(
      `Could not convert provided request handler into a valid ${RequestHandler.name}.`
    );
  }
}
