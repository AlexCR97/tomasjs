export interface Transform<TInput, TOutput> {
  transform(input: TInput): TOutput | Promise<TOutput>;
}
