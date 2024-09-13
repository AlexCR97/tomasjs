import { TomasError } from "./TomasError";

/**
 * An error that is thrown when an operation is not implemented.
 *
 * This error is typically used to indicate that a particular feature or method
 * has not been implemented yet.
 *
 * @extends TomasError
 */
export class NotImplementedError extends TomasError {
  constructor() {
    super("core/NotImplemented", "The operation is not implemented");
  }
}
