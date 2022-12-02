import { ControllerAction } from "./ControllerAction";
import { ControllerActionHandler } from "./types";

export abstract class BaseController {
  abstract readonly route: string;
  readonly actions: ControllerAction[] = [];

  get(path: string, ...handlers: ControllerActionHandler[]) {
    this.actions.push({ method: "get", path, handlers });
  }

  post(path: string, ...handlers: ControllerActionHandler[]) {
    this.actions.push({ method: "post", path, handlers });
  }

  put(path: string, ...handlers: ControllerActionHandler[]) {
    this.actions.push({ method: "put", path, handlers });
  }

  delete(path: string, ...handlers: ControllerActionHandler[]) {
    this.actions.push({ method: "delete", path, handlers });
  }

  patch(path: string, ...handlers: ControllerActionHandler[]) {
    this.actions.push({ method: "patch", path, handlers });
  }
}
