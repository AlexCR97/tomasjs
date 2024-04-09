import { TomasError } from "@/errors";

export type ConfigurationValueType = "boolean" | "number" | "string" | "object";

export class ConfigurationValueNotFoundError extends TomasError {
  constructor(path: string) {
    super("core/conf/ValueNotFound", `No such configuration value found at path "${path}"`);
  }
}

export class ConfigurationValueTypeError extends TomasError {
  constructor(value: any, type: ConfigurationValueType) {
    super("core/conf/InvalidValueType", `Could not convert value ${value} to type "${type}"`);
  }
}
