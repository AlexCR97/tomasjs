import { TomasError } from "./TomasError";

export class InvalidOperationError extends TomasError {
  constructor() {
    super(
      "INVALID_OPERATION",
      "The requested operation is not valid due to the current state of the system."
    );
  }
}
