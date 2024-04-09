import { TomasError } from "./TomasError";

export class InvalidOperationError extends TomasError {
  constructor() {
    super(
      "core/InvalidOperation",
      "The requested operation is not valid due to the current state of the system."
    );
  }
}
