import { Token } from "./Token";

export abstract class TokenAdapter {
  private constructor() {}

  static toString<T>(token: Token<T>): string {
    if (typeof token === "string") {
      return token;
    }

    return token.name;
  }
}
