import { Transform } from "./Transform";
import { TransformFunction } from "./TransformFunction";

export interface TransformFactory<TInput, TOutput> {
  create(): TransformFunction<TInput, TOutput> | Transform<TInput, TOutput>;
}
