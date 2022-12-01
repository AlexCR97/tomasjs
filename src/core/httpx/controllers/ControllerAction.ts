import { ControllerActionHandler, HttpMethod } from "./types";

export interface ControllerAction {
  method: HttpMethod;
  path: string;
  handlers: ControllerActionHandler[];
}
