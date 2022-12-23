import { TomasError } from "@/core/errors";

export class TransformError extends TomasError {
  constructor(input: any, transformName: string, innerError?: any) {
    super(`Could not transform the input ${input} using the transformer ${transformName}.`, {
      innerError,
    });
  }
}
