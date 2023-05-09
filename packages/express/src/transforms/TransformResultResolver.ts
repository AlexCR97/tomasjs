import { TomasError } from "@tomasjs/core";
import { TransformType } from "./TransformType";
import { isTransformFunction } from "./isTransformFunction";
import { isTransformInstance } from "./isTransformInstance";
import { isTransformFactory } from "./isTransformFactory";

export class TransformResultResolver<TInput, TOutput> {
  constructor(private readonly transform: TransformType<TInput, TOutput>) {}

  resolve(input: TInput): TOutput {
    if (isTransformFunction<TInput, TOutput>(this.transform)) {
      return this.transform(input);
    }

    if (isTransformInstance<TInput, TOutput>(this.transform)) {
      return this.transform.transform(input);
    }

    if (isTransformFactory<TInput, TOutput>(this.transform)) {
      var transformType = this.transform.create();
      return new TransformResultResolver(transformType).resolve(input);
    }

    throw new TomasError("Unknown Transform type.", {
      data: {
        transform: this.transform,
      },
    });
  }
}
