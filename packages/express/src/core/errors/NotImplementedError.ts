import { TomasError } from "./TomasError";

export class NotImplementedError extends TomasError {
  constructor(methodName: string) {
    super(`The method "${methodName}" is not implemented.`);
  }
}
