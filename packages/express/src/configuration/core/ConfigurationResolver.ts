import { internalContainer } from "@/container";
import { Configuration } from "./Configuration";
import { ConfigurationToken } from "./ConfigurationToken";

export abstract class ConfigurationResolver {
  private constructor() {}

  static getConfiguration<TSettings extends object>(): Configuration<TSettings> {
    return internalContainer.get(ConfigurationToken);
  }
}
