/**
 * Represents a failure result with an error of type {@link T}.
 *
 * This type is a specific case of {@link Result} where the result is a failure, and the `data` is `null`.
 *
 * @template T The type of the error.
 */
export type ResultFailure<T> = Result<T, null>;

/**
 * Represents a success result with a value of type {@link T}.
 *
 * This type is a specific case of {@link Result} where the result is successful, and the `error` is `null`.
 *
 * @template T The type of the success value. Defaults to `null`.
 */
export type ResultSuccess<T = null> = Result<null, T>;

/**
 * Represents the result of an operation, which can either be a success or a failure.
 *
 * @template TError The type of the error.
 * @template TResult The type of the result value.
 */
export class Result<TError, TResult> {
  private constructor(
    /**
     * The error that caused the result to fail.
     */
    readonly error: TError,

    /**
     * The data returned by the successful result.
     */
    readonly data: TResult
  ) {}

  /**
   * Creates a failure result with the specified error.
   *
   * @param {TError} error - The error associated with the failure.
   * @returns {ResultFailure<TError>} A `ResultFailure` instance with the given error and `null` as data.
   *
   * @example
   * const failureResult = Result.failure('An error occurred');
   * // failureResult.error is 'An error occurred'
   * // failureResult.data is null
   */
  static failure<T>(error: T): ResultFailure<T> {
    return new Result(error, null);
  }

  /**
   * Creates a success result with the specified data.
   *
   * @param {T} [data] - The data associated with the success. Defaults to `null` if not provided.
   * @returns {ResultSuccess<T>} A `ResultSuccess` instance with the given data and `null` as error.
   *
   * @example
   * const successResult = Result.success('Operation successful');
   * // successResult.error is null
   * // successResult.data is 'Operation successful'
   *
   * @example
   * const emptySuccessResult = Result.success();
   * // emptySuccessResult.error is null
   * // emptySuccessResult.data is null
   */
  static success<T = null>(data?: T): ResultSuccess<T> {
    if (data !== undefined) {
      return new Result(null, data);
    }

    return new Result(null, null as any); // TODO Do not use "any"
  }
}
