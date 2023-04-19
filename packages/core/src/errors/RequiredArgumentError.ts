import { TomasError } from "./TomasError";

export class RequiredArgumentError extends TomasError {
  constructor(argumentName: string) {
    super(`The argument "${argumentName}" is required`);
  }

  static throw(value: any, argumentName: string) {
    if (value === undefined || value === null) {
      throw new RequiredArgumentError(argumentName);
    }
  }
}
