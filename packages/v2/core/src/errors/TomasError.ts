export class TomasError extends Error {
  readonly code: string;
  readonly innerError?: any;
  readonly data?: any;

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(`${code}: ${message}`);
    this.code = code;
    this.innerError = options?.innerError;
    this.data = options?.data;
  }
}

export type ErrorOptions = {
  innerError?: any;
  data?: any;
};
