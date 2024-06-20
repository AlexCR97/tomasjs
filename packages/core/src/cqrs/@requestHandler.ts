import { Constructor } from "@/system";
import { IRequest } from "./IRequest";
import { REQUEST_HANDLERS, RequestHandler, isRequestHandler } from "./RequestHandler";

export function requestHandler<TRequest>(requestConstructor: Constructor<TRequest>) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    new RequestHandlerMetadata(constructor).requestConstructor = requestConstructor;
    return constructor;
  };
}

export class RequestHandlerMetadata<TRequest extends IRequest<TResult>, TResult> {
  private readonly REQUEST_CONSTRUCTOR = `${REQUEST_HANDLERS}/Constructor`;

  constructor(
    private readonly requestHandler:
      | RequestHandler<TRequest, TResult>
      | Constructor<RequestHandler<TRequest, TResult>>
  ) {}

  get requestConstructor(): Constructor<any> {
    return Reflect.getMetadata(this.REQUEST_CONSTRUCTOR, this.requestHandlerPrototype);
  }
  set requestConstructor(value: Constructor<any>) {
    Reflect.defineMetadata(this.REQUEST_CONSTRUCTOR, value, this.requestHandlerPrototype);
  }

  private get requestHandlerPrototype() {
    return isRequestHandler(this.requestHandler)
      ? Object.getPrototypeOf(this.requestHandler)
      : this.requestHandler.prototype;
  }
}
