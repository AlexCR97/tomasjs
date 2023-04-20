import { TomasError, Transform, TransformFactory, TransformFunction } from "@tomasjs/core";
import { PipeTransformParam } from "./PipeTransformParam";

export class TransformBridge<TInput, TOutput> {
  constructor(private readonly transformer: PipeTransformParam<TInput, TOutput>) {}

  transform(input: TInput): TOutput | Promise<TOutput> {
    if (this.isFunction(this.transformer)) {
      return this.transformer(input);
    }

    if (this.isInstance(this.transformer)) {
      return this.transformer.transform(input);
    }

    if (this.isFactory(this.transformer)) {
      const transformer = this.transformer.create();
      return new TransformBridge(transformer).transform(input);
    }

    throw new TomasError(`Unknown transformer ${this.transformer}`);
  }

  private isFunction(
    transformer: PipeTransformParam<TInput, TOutput>
  ): transformer is TransformFunction<TInput, TOutput> {
    if (typeof transformer !== "function") {
      return false;
    }

    // Considering that a TransformFunction must be a function...
    return (
      transformer.prototype === undefined && // The prototype must be undefined
      transformer.length === 1 // It must receive 1 argument
    );
  }

  private isInstance(
    transformer: PipeTransformParam<TInput, TOutput>
  ): transformer is Transform<TInput, TOutput> {
    const func = (transformer as any).transform as Function;

    if (typeof func !== "function") {
      return false;
    }

    // Considering that the "transform" must be a named function...
    return (
      func.name.trim() === "transform" && // The name must be "transform"
      func.prototype === undefined && // The prototype must be undefined
      func.length === 1 // It must receive 1 argument
    );
  }

  private isFactory(
    transformer: PipeTransformParam<TInput, TOutput>
  ): transformer is TransformFactory<TInput, TOutput> {
    const func = (transformer as any).create as Function;

    if (typeof func !== "function") {
      return false;
    }

    // Considering that the "create" must be a named function...
    return (
      func.name.trim() === "create" && // The name must be "create"
      func.prototype === undefined && // The prototype must be undefined
      func.length === 0 // It must receive 0 arguments
    );
  }
}
