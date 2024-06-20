import { TomasError } from "./TomasError";

export class InvalidCastError extends TomasError {
  constructor(fromType: string, toType: string) {
    super("core/InvalidCast", `Cannot cast from type ${fromType} to type ${toType}.`, {
      data: { fromType, toType },
    });
  }
}
