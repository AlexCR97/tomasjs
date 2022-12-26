import { HttpContext } from "@/core";

export type GuardFunction = (
  context: HttpContext
) => boolean | Promise<boolean>;
