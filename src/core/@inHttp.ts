import { inject } from "tsyringe";
import { HttpContext } from "./HttpContext";

export function inHttp() {
  return inject(HttpContext);
}
