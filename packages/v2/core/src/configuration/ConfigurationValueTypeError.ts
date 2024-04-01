import { TomasError } from "@/errors/TomasError";
import { ConfigurationValueType } from "./ConfigurationSection";

export class ConfigurationValueTypeError extends TomasError {
  constructor(value: any, type: ConfigurationValueType) {
    super(
      "core/configuration/ValueTypeConversion",
      `Could not convert value ${value} to type "${type}"`
    );
  }
}
