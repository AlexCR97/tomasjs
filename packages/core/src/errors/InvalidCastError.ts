import { TomasError } from "./TomasError";

/**
 * An error that occurs when a type cast operation fails.
 *
 * @extends TomasError
 */
export class InvalidCastError extends TomasError {
  /**
   * @param fromType - The type from which casting is attempted.
   * @param toType - The type to which casting is attempted.
   */
  constructor(fromType: string, toType: string) {
    super("core/InvalidCast", `Cannot cast from type ${fromType} to type ${toType}.`, {
      data: { fromType, toType },
    });
  }
}
