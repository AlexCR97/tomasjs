import { inject as inversify_inject } from "inversify";
import { Token } from "./Token";
import { TokenAdapter } from "./TokenAdapter";

export function inject<T>(token: Token<T>) {
  const tokenStr = TokenAdapter.toString(token);
  return inversify_inject<T>(tokenStr);
}
