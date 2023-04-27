import { TomasError } from "@/errors";
import { Token } from "./Token";

export class RemoveTokenError<T> extends TomasError {
  constructor(token: Token<T>, innerError: any) {
    super(`Could not remove nonexisting token "${token}"`, { innerError });
  }
}
