import { TomasError } from "@/errors";
import { TransformFunction } from "./TransformFunction";

export const booleanTransform: TransformFunction<string, boolean> = (input) => {
  if (input === "true") {
    return true;
  }

  if (input === "false") {
    return false;
  }

  throw new TomasError(`Unknown boolean value "${input}"`);
};
