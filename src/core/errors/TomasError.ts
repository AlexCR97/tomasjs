export class TomasError extends Error {
  readonly innerError?: any;

  constructor(message: string, options?: { innerError: any }) {
    super(message);
    this.innerError = options?.innerError;
  }
}
