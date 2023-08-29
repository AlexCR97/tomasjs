import { TomasError } from "@/errors";
import {
  AsyncTransformType,
  isAsyncTransformFunction,
  isAsyncTransformInstance,
  isAsyncTransformFactory,
} from "@/transforms";

/**
 * Represents an async transformation pipeline.
 * @template TInput - The input type of the pipeline.
 */
export class AsyncPipe<TInput> {
  private constructor(private readonly input: TInput) {}

  static promise<TInput>(input: TInput): Promise<AsyncPipe<TInput>> {
    return new Promise((resolve) => resolve(new AsyncPipe<TInput>(input)));
  }

  /**
   * Applies an async transformation to the current input value and returns a new AsyncPipe with the transformed value.
   * @template TOutput - The output type of the transformation.
   * @param {TransformType<TInput, TOutput>} transform - The transformation to apply.
   * @returns {AsyncPipe<TOutput>} A new AsyncPipe with the transformed value.
   * @throws {TomasError} Thrown if the provided transformation is of an unknown type.
   */
  async apply<TOutput>(
    transform: AsyncTransformType<TInput, TOutput>
  ): Promise<AsyncPipe<TOutput>> {
    if (isAsyncTransformFunction<TInput, TOutput>(transform)) {
      const next = await transform(this.input);
      return new AsyncPipe<TOutput>(next);
    }

    if (isAsyncTransformInstance<TInput, TOutput>(transform)) {
      const next = await transform.transform(this.input);
      return new AsyncPipe<TOutput>(next);
    }

    if (isAsyncTransformFactory<TInput, TOutput>(transform)) {
      const newTransform = transform.create();
      return this.apply(newTransform);
    }

    throw new TomasError(`Unknown transform type: ${transform}`);
  }

  /**
   * Returns the current value of the AsyncPipe.
   * @returns {TInput} The current value.
   */
  get(): TInput {
    return this.input;
  }
}
