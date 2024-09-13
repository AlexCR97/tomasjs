import { TomasError } from "./TomasError";

/**
 * An error that occurs when an invalid operation is performed.
 *
 * This error is typically thrown when an operation cannot be completed due to the current state of the system.
 *
 * @extends TomasError
 */
export class InvalidOperationError extends TomasError {
  /**
   * @param message - An optional custom message describing the error. If not provided, a default message is used.
   */
  constructor(message?: string) {
    const code = "core/InvalidOperation";

    if (message && message.trim().length > 0) {
      super(code, message);
    } else {
      super(code, "The requested operation is not valid due to the current state of the system.");
    }
  }
}
