import { Token } from "./Token";
import { TomasError } from "./TomasError";

export class ServiceNotFoundError<T> extends TomasError {
  constructor(token: Token<T>) {
    super("SERVICE_NOT_FOUND", `No such service found with token ${token}`, { data: { token } });
  }
}
