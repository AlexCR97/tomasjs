/**
 * Creates a new pipeline for transforming data.
 *
 * This function initializes a new transformation pipeline with an optional input value.
 *
 * @template TInput The type of the input value.
 * @param {TInput} [input] - The initial input value for the pipeline.
 * @returns {IPipe<TInput>} A new `IPipe` instance that allows chaining transformations.
 *
 * @example
 * const result = pipe(5)
 *   .pipe(x => x * 2)
 *   .pipe(x => x + 3)
 *   .get();
 * // result is 13
 */
export function pipe<TInput>(input?: TInput): IPipe<TInput> {
  const pipeline = new TransformationPipeline(input);
  return new Pipe(pipeline);
}

/**
 * Represents a transformation function that takes an input of type {@link TInput} and returns an output of type {@link TOutput}.
 *
 * @template TInput The type of the input value.
 * @template TOutput The type of the output value.
 * @param {TInput} input - The input value.
 * @returns {TOutput} The transformed output value.
 */
export type Transform<TInput, TOutput> = (input: TInput) => TOutput;

/**
 * A pipeline that allows chaining of transformations.
 *
 * @template TInput The type of the initial input value.
 */
export interface IPipe<TInput> {
  /**
   * Adds a transformation to the pipeline and returns a new {@link IPipe} instance for further chaining.
   *
   * @template TOutput The type of the output value from the transformation.
   * @param transform The transformation function to add.
   * @returns A new {@link IPipe} instance with the added transformation.
   */
  pipe<TOutput>(transform: (input: TInput) => TOutput): IPipe<TOutput>;

  /**
   * Retrieves the final result after applying all transformations.
   *
   * @returns {TInput} The final result after all transformations.
   */
  get(): TInput;
}

class Pipe<TInput> implements IPipe<TInput> {
  constructor(private readonly pipeline: TransformationPipeline) {}

  pipe<TOutput>(transform: (input: TInput) => TOutput): IPipe<TOutput> {
    this.pipeline.addTransform(transform);
    return new Pipe<TOutput>(this.pipeline);
  }

  get(): TInput {
    return this.pipeline.applyTransformations();
  }
}

class TransformationPipeline {
  private readonly initialValue: any;
  private readonly transformations: Transform<any, any>[] = [];

  constructor(initialValue: any) {
    this.initialValue = initialValue;
  }

  addTransform(transform: Transform<any, any>) {
    this.transformations.push(transform);
  }

  applyTransformations() {
    let current = this.initialValue;

    for (const transform of this.transformations) {
      current = transform(current);
    }

    return current;
  }
}
