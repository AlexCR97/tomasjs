import { HttpMethod } from "../HttpMethod";
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

export abstract class Controller {
  abstract readonly route: string;

  private readonly actions: ActionMap<any>[] = [];

  get<TResponse = void>(path: string, handler: ControllerActionHandler<TResponse>) {
    this.actions.push({
      method: "get",
      path,
      handler, // TODO Is arrow function required here?
    });
  }

  post<TResponse = void>(path: string, handler: ControllerActionHandler<TResponse>) {
    this.actions.push({
      method: "post",
      path,
      handler, // TODO Is arrow function required here?
    });
  }
}
