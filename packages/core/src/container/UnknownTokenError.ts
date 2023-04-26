import { TomasError } from "@/errors";
import { Token } from "./Token";

export class UnknownTokenError<T> extends TomasError {
  constructor(token: Token<T>, innerError: any) {
    super(`Could not find a service for the token "${token}"`, { innerError });
  }
}
