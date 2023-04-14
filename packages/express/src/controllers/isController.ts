import { Controller } from "./Controller";

export function isController<TController extends Controller>(obj: any): obj is TController {
  return typeof obj === "object"; // TODO Improve "isController" type check?
}
