import { inject as tsyringe_inject } from "tsyringe";
import { Token } from "./Token";

export function inject<T>(token: Token<T>) {
  return tsyringe_inject(token);
}
