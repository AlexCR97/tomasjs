import { AsyncTransform } from "./AsyncTransform";
import { AsyncTransformFactory } from "./AsyncTransformFactory";
import { AsyncTransformFunction } from "./AsyncTransformFunction";

export type AsyncTransformType<TInput, TOutput> =
  | AsyncTransformFunction<TInput, TOutput>
  | AsyncTransform<TInput, TOutput>
  | AsyncTransformFactory<TInput, TOutput>;
