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
  apply<TOutput>(transform: (input: TInput) => TOutput): Pipe<TOutput> {
    const next = transform(this.input);
    return new Pipe<TOutput>(next);
  }

  /**
   * Returns the current value of the Pipe.
   * @returns {TInput} The current value.
   */
  get(): TInput {
    return this.input;
  }
}
