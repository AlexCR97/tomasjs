import { TransformFunction } from "../definitions";
import { TransformError } from "./TransformError";

export const NumberTransform: TransformFunction<any, number> = (input) => {
  if (input === undefined || input === null) {
    throw new TransformError(input, NumberTransform.name);
  }

  try {
    return Number(input);
  } catch (err) {
    throw new TransformError(input, NumberTransform.name, err);
  }
};
