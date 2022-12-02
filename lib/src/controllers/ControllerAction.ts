import { HttpMethod } from "../HttpMethod";
import { ControllerActionHandler } from "./types";

export interface ControllerAction {
  method: HttpMethod;
  path: string;
  handlers: ControllerActionHandler[];
}
