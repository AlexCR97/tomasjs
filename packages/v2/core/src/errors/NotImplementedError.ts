import { TomasError } from "./TomasError";

export class NotImplementedError extends TomasError {
  constructor() {
    super("core/NotImplemented", "The operation is not implemented");
  }
}
