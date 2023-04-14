export class StatusCodeError extends Error {
  constructor(public readonly status: number) {
    super(`An error occurred with status code ${status}`);
  }
}
