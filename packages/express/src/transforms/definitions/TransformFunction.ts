export type TransformFunction<TInput, TOutput> = (input: TInput) => TOutput | Promise<TOutput>;
