import { TomasError } from "@/errors/TomasError";

export class ConfigurationValueError extends TomasError {
  constructor(path: string) {
    super("core/configuration/Value", `No such configuration value found at path "${path}"`);
  }
}
