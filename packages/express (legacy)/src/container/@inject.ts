import { inject as inversify_inject } from "inversify";
import { Token } from "./Token";

export function inject<T>(token: Token<T>) {
  return inversify_inject<T>(token);
}
