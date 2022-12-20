import { inject } from "tsyringe";
import { HttpContextAccessor } from "./HttpContextAccessor";

export function inHttpContextAccessor() {
  return inject(HttpContextAccessor);
}
