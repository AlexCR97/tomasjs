/**
 * Starts a transformation pipeline.
 * @param input The initial input of the pipe
 * @returns A pipe which can then be used to chain transformations.
 */
export function pipe<TInput>(input: TInput): IPipe<TInput> {
  return new Pipe(input);
}

/**
 * Represents a transformation pipeline.
 * @template TInput - The input type of the pipeline.
 */
interface IPipe<TInput> {
  /**
   * Applies a transformation to the current input value and returns a new pipe with the transformed value.
   * @template TOutput - The output type of the transformation.
   * @param {(input: TInput) => TOutput} transform - The transformation to apply.
   * @returns {Pipe<TOutput>} A new pipe with the transformed value.
   */
  pipe<TOutput>(transform: (input: TInput) => TOutput): IPipe<TOutput>;

  /**
   * Returns the current value of the pipe.
   * @returns {TInput} The current value.
   */
  get(): TInput;
}

class Pipe<TInput> implements IPipe<TInput> {
  constructor(private readonly input: TInput) {}

  pipe<TOutput>(transform: (input: TInput) => TOutput): IPipe<TOutput> {
    const next = transform(this.input);
    return new Pipe<TOutput>(next);
  }

  get(): TInput {
    return this.input;
  }
}
