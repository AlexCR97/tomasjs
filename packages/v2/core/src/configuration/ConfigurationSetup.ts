import { ContainerSetup } from "@/dependency-injection";
import { Configuration } from "./Configuration";
import { ConfigurationSection } from "./ConfigurationSection";
import {
  ConfigurationSource,
  EnvironmentConfigurationSource,
  JsonConfigurationSource,
  RawConfigurationSource,
} from "./ConfigurationSource";

export class ConfigurationSetup {
  private readonly sources: ConfigurationSource[] = [];

  addEnvironmentSource(): ConfigurationSetup {
    this.sources.push(EnvironmentConfigurationSource.new());
    return this;
  }

  addJsonSource(path?: string): ConfigurationSetup {
    this.sources.push(JsonConfigurationSource.new(path));
    return this;
  }

  addRawSource(source: Record<any, any>): ConfigurationSetup {
    this.sources.push(RawConfigurationSource.new(source));
    return this;
  }

  build(): ContainerSetup {
    return (container) => {
      const roots: ConfigurationSection[] = this.sources.map((source) => {
        const rootSource = source.readSource();
        return ConfigurationSection.fromRoot(rootSource);
      });

      const configuration = new Configuration(roots);

      container.add("singleton", configurationToken, configuration);
    };
  }
}

// TODO Change for Symbol
export const configurationToken = "@tomasjs/core/Configuration";
