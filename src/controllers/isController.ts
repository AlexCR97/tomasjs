import { Controller } from "./Controller";

export function isController(obj: any): obj is Controller {
  return typeof obj === "object"; // TODO Improve "isController" type check?
}
