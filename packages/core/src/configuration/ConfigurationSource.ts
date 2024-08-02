import { readJsonFile } from "@/files";

export interface ConfigurationSource {
  type: ConfigurationSourceType;
  readSource(): Record<any, any>;
}

export type ConfigurationSourceType = "environment" | "json" | "raw";

export class EnvironmentConfigurationSource implements ConfigurationSource {
  private constructor(readonly type: ConfigurationSourceType) {}

  static new(): EnvironmentConfigurationSource {
    return new EnvironmentConfigurationSource("environment");
  }

  readSource(): Record<any, any> {
    return process.env;
  }
}

export class JsonConfigurationSource implements ConfigurationSource {
  private constructor(readonly type: ConfigurationSourceType, private readonly path: string) {}

  private static readonly defaultPath = "./appconfig.json";
  static new(path?: string): JsonConfigurationSource {
    return new JsonConfigurationSource("json", path ?? this.defaultPath);
  }

  readSource(): Record<any, any> {
    return readJsonFile(this.path);
  }
}

export class RawConfigurationSource implements ConfigurationSource {
  private constructor(readonly type: ConfigurationSourceType, readonly source: Record<any, any>) {}

  static new(source: Record<any, any>): RawConfigurationSource {
    return new RawConfigurationSource("raw", source);
  }

  readSource(): Record<any, any> {
    return this.source;
  }
}
