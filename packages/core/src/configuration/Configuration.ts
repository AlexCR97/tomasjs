import { merge } from "@/system";
import {
  ConfigurationSection,
  ConfigurationSectionNotFoundError,
  IConfigurationSection,
} from "./ConfigurationSection";
import { ConfigurationValueNotFoundError, ConfigurationValueType } from "./ConfigurationValue";

export interface IConfiguration extends IConfigurationSection {}

export class Configuration implements IConfiguration {
  constructor(private readonly roots: readonly IConfigurationSection[]) {}

  section(path: string): IConfigurationSection | null {
    for (const root of this.roots) {
      const section = root.section(path);

      if (section !== null) {
        return section;
      }
    }

    return null;
  }

  sectionOrThrow(path: string): IConfigurationSection {
    const section = this.section(path);

    if (section === null) {
      throw new ConfigurationSectionNotFoundError(ConfigurationSection.root, path);
    }

    return section;
  }

  value<T>(type: ConfigurationValueType): T | null {
    const rootValues = this.roots.map((root) => root.valueOrThrow<Record<any, any>>(type));
    return merge(rootValues);
  }

  valueOrThrow<T>(type: ConfigurationValueType): T {
    const value = this.value<T>(type);

    if (value === null) {
      throw new ConfigurationValueNotFoundError(ConfigurationSection.root);
    }

    return value;
  }

  static empty(): IConfiguration {
    return new Configuration([]);
  }
}
