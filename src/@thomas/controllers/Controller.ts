import { constructor } from "tsyringe/dist/typings/types";
import { HttpMethod } from "../HttpMethod";
import { Middleware } from "../middleware";
import { AsyncMiddlewareHandler, MiddlewareHandler } from "../middleware/types";
import { RequestContext } from "../requests";

export type ActionHandler<TResponse = void> = (context: RequestContext) => TResponse;

export type AsyncActionHandler<TResponse = void> = (context: RequestContext) => Promise<TResponse>;

export type ControllerActionHandler<TResponse = void> =
  | ActionHandler<TResponse>
  | AsyncActionHandler<TResponse>;

export interface ActionMap<TResponse = void> {
  method: HttpMethod;
  path: string;
  handler: ControllerActionHandler<TResponse>;
}

export type ControllerMiddleware<T extends Middleware = Middleware> =
  | MiddlewareHandler
  | AsyncMiddlewareHandler
  | Middleware
  | constructor<T>

export interface MiddlewareMap {
  method: HttpMethod;
  path: string;
  middleware: ControllerMiddleware;
}

interface ActionOptions {
  onBefore?: ControllerMiddleware[];
  onAfter?: ControllerMiddleware[];
}

export abstract class Controller {
  abstract readonly route: string;

  private readonly onBeforeMiddleware: ControllerMiddleware[] = [];
  private readonly onBeforeMiddlewareMap: MiddlewareMap[] = []
  private readonly actions: ActionMap<any>[] = [];
  private readonly onAfterMiddlewareMap: MiddlewareMap[] = []
  private readonly onAfterMiddleware: ControllerMiddleware[] = [];
  
  onBefore(middleware: ControllerMiddleware) {
    this.onBeforeMiddleware.push(middleware);
  }

  get<TResponse = void>(path: string, handler: ControllerActionHandler<TResponse>, options?: ActionOptions) {
    this.actions.push({
      method: "get",
      path,
      handler, // TODO Is arrow function required here?
    });

    if (options) {
      if (options.onBefore) {
        const x = options.onBefore.map(middleware => <MiddlewareMap>({
          method: 'get',
          path,
          middleware,
        }));

        this.onBeforeMiddlewareMap.push(...x)
      }
    }
  }

  post<TResponse = void>(path: string, handler: ControllerActionHandler<TResponse>, options?: ActionOptions) {
    this.actions.push({
      method: "post",
      path,
      handler, // TODO Is arrow function required here?
    });
  }

  onAfter(middleware: ControllerMiddleware) {
    this.onAfterMiddleware.push(middleware);
  }

  private map() {
    
  }
}
