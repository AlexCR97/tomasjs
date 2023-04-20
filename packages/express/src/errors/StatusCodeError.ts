import { TomasError } from "@tomasjs/core";

export class StatusCodeError extends TomasError {
  constructor(public readonly status: number) {
    super(`An error occurred with status code ${status}`);
  }
}
