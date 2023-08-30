export type ResultSuccess<T = null> = Result<T, null>;

export type ResultFailure<T> = Result<null, T>;

export class Result<TResult = unknown, TError = unknown> {
  private constructor(readonly data: TResult, readonly error: TError) {}

  static success<T>(data: T): ResultSuccess<T> {
    return new Result(data, null);
  }

  static failure<T>(error: T): ResultFailure<T> {
    return new Result(null, error);
  }
}
