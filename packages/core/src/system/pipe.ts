/**
 * Starts a transformation pipeline.
 * @param input The initial input of the pipe
 * @returns A pipe which can then be used to chain transformations.
 */
export function pipe<TInput>(input: TInput): IPipe<TInput> {
  const pipeline = new TransformationPipeline(input);
  return new Pipe(pipeline);
}

export type Transform<TInput, TOutput> = (input: TInput) => TOutput;

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
