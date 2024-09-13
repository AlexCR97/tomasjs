/**
 * Represents a TomasJS error.
 *
 * This class extends the built-in {@link Error} and includes a `code` for categorizing the error,
 * an `innerError` for wrapping other errors, and `data` for optional additional context.
 *
 * @extends Error
 */
export class TomasError extends Error {
  /**
   * The code that identifies the type of error.
   */
  readonly code: string;

  /**
   * An optional inner error that caused this error.
   */
  readonly innerError?: any;

  /**
   * Optional additional data related to the error.
   */
  readonly data?: any;

  /**
   * @param code - The code that identifies the type of error.
   * @param message - A description of the error.
   * @param options - Optional additional properties for the error.
   */
  constructor(code: string, message: string, options?: ErrorOptions) {
    super(`${code}: ${message}`);
    this.code = code;
    this.innerError = options?.innerError;
    this.data = options?.data;
  }
}

/**
 * Options for customizing a {@link TomasError}.
 */
export type ErrorOptions = {
  /**
   * An optional inner error that caused this error.
   */
  innerError?: any;

  /**
   * Optional additional data related to the error.
   */
  data?: any;
};
