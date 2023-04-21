import { globalContainer } from "@/container";
import { Configuration } from "./Configuration";
import { ConfigurationToken } from "./ConfigurationToken";

export class ConfigurationResolver {
  getConfiguration<TSettings extends object>(): Configuration<TSettings> {
    return globalContainer.get(ConfigurationToken);
  }
}
