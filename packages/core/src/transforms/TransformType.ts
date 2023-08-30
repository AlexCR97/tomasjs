import { Transform } from "./Transform";
import { TransformFactory } from "./TransformFactory";
import { TransformFunction } from "./TransformFunction";

export type TransformType<TInput, TOutput> =
  | TransformFunction<TInput, TOutput>
  | Transform<TInput, TOutput>
  | TransformFactory<TInput, TOutput>;
