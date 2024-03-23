import { TomasError } from "./TomasError";

export class NotImplementedError extends TomasError {
  constructor() {
    super("NOT_IMPLEMENTED", "Not implemented");
  }
}
