import { DomainError } from "./DomainError";

export class StatusCodeError extends DomainError {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: any
  ) {
    super(code, message, details);
  }
}
