import {
  ConfigurationSection,
  ConfigurationValueType,
  IConfigurationSection,
} from "./ConfigurationSection";
import { ConfigurationSectionError } from "./ConfigurationSectionError";
import { ConfigurationValueError } from "./ConfigurationValueError";
import { merge } from "./merge";

export interface IConfiguration extends IConfigurationSection {}

export class Configuration implements IConfiguration {
  constructor(private readonly roots: readonly ConfigurationSection[]) {}

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
      throw new ConfigurationSectionError("$(root)", path);
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
      throw new ConfigurationValueError("$(root)");
    }

    return value;
  }
}
