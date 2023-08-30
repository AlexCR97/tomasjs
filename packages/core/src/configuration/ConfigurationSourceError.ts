import { TomasError } from "@/errors";
import { ConfigurationSource } from "./ConfigurationSource";

export class ConfigurationSourceError extends TomasError {
  constructor(source: ConfigurationSource) {
    super(`Unknown configuration source "${source}"`, { data: { source } });
  }
}
