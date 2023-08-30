/**
 * A failure result.
 */
export type ResultFailure<T> = Result<T, null>;

/**
 * A successful result.
 */
export type ResultSuccess<T = null> = Result<null, T>;

/**
 * Represents a result that could have failed or succeeded.
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

  static failure<T>(error: T): ResultFailure<T> {
    return new Result(error, null);
  }

  static success<T = null>(data?: T): ResultSuccess<T> {
    if (data !== undefined) {
      return new Result(null, data);
    }

    return new Result(null, null as any); // TODO Do not use "any"
  }
}
