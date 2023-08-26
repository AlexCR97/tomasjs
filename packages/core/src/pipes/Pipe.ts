import { TomasError } from "@/errors";
import {
  TransformType,
  isTransformFunction,
  isTransformInstance,
  isTransformFactory,
} from "@/transforms";

/**
 * Represents a transformation pipeline.
 * @template TInput - The input type of the pipeline.
 */
export class Pipe<TInput> {
  constructor(private readonly input: TInput) {}

  /**
   * Applies a transformation to the current input value and returns a new Pipe with the transformed value.
   * @template TOutput - The output type of the transformation.
   * @param {TransformType<TInput, TOutput>} transform - The transformation to apply.
   * @returns {Pipe<TOutput>} A new Pipe with the transformed value.
   * @throws {TomasError} Thrown if the provided transformation is of an unknown type.
   */
  apply<TOutput>(transform: TransformType<TInput, TOutput>): Pipe<TOutput> {
    if (isTransformFunction<TInput, TOutput>(transform)) {
      const next = transform(this.input);
      return new Pipe<TOutput>(next);
    }

    if (isTransformInstance<TInput, TOutput>(transform)) {
      const next = transform.transform(this.input);
      return new Pipe<TOutput>(next);
    }

    if (isTransformFactory<TInput, TOutput>(transform)) {
      const newTransform = transform.create();
      return this.apply(newTransform);
    }

    throw new TomasError(`Unknown transform type: ${transform}`);
  }

  /**
   * Returns the current value of the Pipe.
   * @returns {TInput} The current value.
   */
  get(): TInput {
    return this.input;
  }
}
