import { Transform, TransformFactory, TransformFunction } from "@tomasjs/core";

export type TransformType<TInput, TOutput> =
  | TransformFunction<TInput, TOutput>
  | Transform<TInput, TOutput>
  | TransformFactory<TInput, TOutput>;
