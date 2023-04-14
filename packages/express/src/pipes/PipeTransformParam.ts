import { Transform, TransformFactory, TransformFunction } from "@/transforms";

// TODO Add support for constructors
export type PipeTransformParam<TInput, TOutput> =
  | TransformFunction<TInput, TOutput>
  | Transform<TInput, TOutput>
  | TransformFactory<TInput, TOutput>;
