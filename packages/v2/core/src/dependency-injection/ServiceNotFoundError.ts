import { TomasError } from "@/errors/TomasError";
import { Token } from "./Token";

export class ServiceNotFoundError<T> extends TomasError {
  constructor(token: Token<T>) {
    super("SERVICE_NOT_FOUND", `No such service found with token ${token}`, { data: { token } });
  }
}
