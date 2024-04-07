import { TomasError } from "@/errors/TomasError";

export class NotImplementedError extends TomasError {
  constructor() {
    super("NOT_IMPLEMENTED", "The operation is not implemented");
  }
}
