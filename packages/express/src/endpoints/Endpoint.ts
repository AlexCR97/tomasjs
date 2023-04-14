import { HttpContext } from "@/core";

export interface Endpoint {
  handle(context: HttpContext): any | Promise<any>;
}
