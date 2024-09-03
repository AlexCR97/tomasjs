import { TomasError } from "./TomasError";

export class InvalidOperationError extends TomasError {
  constructor(message?: string) {
    const code = "core/InvalidOperation";

    if (message && message.trim().length > 0) {
      super(code, message);
    } else {
      super(code, "The requested operation is not valid due to the current state of the system.");
    }
  }
}
