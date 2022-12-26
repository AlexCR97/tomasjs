import { GuardContext } from "./GuardContext";

export type GuardFunction = (
  context: GuardContext
) => boolean | Promise<boolean>;
