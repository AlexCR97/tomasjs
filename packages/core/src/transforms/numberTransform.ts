import { TransformFunction } from "./TransformFunction";
import { TransformError } from "./TransformError";

export const numberTransform: TransformFunction<any, number> = (input) => {
  if (input === undefined || input === null) {
    throw new TransformError(input, numberTransform.name);
  }

  try {
    return Number(input);
  } catch (err) {
    throw new TransformError(input, numberTransform.name, err);
  }
};
