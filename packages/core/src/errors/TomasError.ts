export class TomasError extends Error {
  readonly innerError?: any;
  readonly data?: any;

  constructor(message: string, options?: { innerError?: any; data?: any }) {
    super(message);
    this.innerError = options?.innerError;
    this.data = options?.data;
  }
}
