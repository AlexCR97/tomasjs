export class TomasError extends Error {
  readonly code: string;
  readonly innerError?: any;
  readonly data?: any;

  constructor(code: string, message: string, options?: { innerError?: any; data?: any }) {
    super(message);
    this.code = code;
    this.innerError = options?.innerError;
    this.data = options?.data;
  }
}
