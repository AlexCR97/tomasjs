import { TomasError } from "@/errors";

/**
 * Defines the possible types of values that can be stored in a configuration object.
 */
export type ConfigurationValueType = "boolean" | "number" | "string" | "object";

/**
 * Thrown when a configuration value cannot be found at the specified path.
 */
export class ConfigurationValueNotFoundError extends TomasError {
  /**
   * @param path - The path at which the configuration value was not found.
   */
  constructor(path: string) {
    super("core/conf/ValueNotFound", `No such configuration value found at path "${path}"`);
  }
}

/**
 * Thrown when a configuration value cannot be converted to the expected type.
 */
export class ConfigurationValueTypeError extends TomasError {
  /**
   * @param value - The configuration value that caused the type error.
   * @param type - The expected type of the configuration value.
   */
  constructor(value: any, type: ConfigurationValueType) {
    super("core/conf/InvalidValueType", `Could not convert value ${value} to type "${type}"`);
  }
}
