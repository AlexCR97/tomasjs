import { readJsonFile } from "@/files";
import { IConfiguration } from "./Configuration";

/**
 * The available types of configuration sources:
 * - `environment`: values are read from environment variables. See {@link EnvironmentConfigurationSource}.
 * - `json`: values are read from a JSON file. See {@link JsonConfigurationSource}.
 * - `raw`: values are read from a provided object. See {@link RawConfigurationSource}.
 */
export type ConfigurationSourceType = "environment" | "json" | "raw";

/**
 * Represents a source from which values are read. These values
 * can then be used to be loaded into an {@link IConfiguration}.
 */
export interface ConfigurationSource {
  /** The type of the configuration source. */
  type: ConfigurationSourceType;

  /**
   * Reads the configuration source and returns its contents as a key-value object.
   * The reading strategy depends on the {@link type} property.
   *
   * @returns An object containing the configuration values as key-value pairs.
   */
  readSource(): Record<any, any>;
}

/**
 * A {@link ConfigurationSource} that reads from environment variables.
 */
export class EnvironmentConfigurationSource implements ConfigurationSource {
  private constructor(readonly type: ConfigurationSourceType) {}

  /**
   * Creates a new instance of {@link EnvironmentConfigurationSource}.
   * @returns A new EnvironmentConfigurationSource.
   */
  static new(): EnvironmentConfigurationSource {
    return new EnvironmentConfigurationSource("environment");
  }

  /**
   * Reads the environment variables and returns them as a configuration object.
   * @returns A record containing the environment variables as key-value pairs.
   */
  readSource(): Record<any, any> {
    return process.env;
  }
}

/**
 * A {@link ConfigurationSource} that reads from a JSON file.
 */
export class JsonConfigurationSource implements ConfigurationSource {
  private constructor(readonly type: ConfigurationSourceType, private readonly path: string) {}

  private static readonly defaultPath = "./appconfig.json";

  /**
   * Creates a new instance of {@link JsonConfigurationSource}.
   * @param path - The file path of the JSON configuration file. Defaults to "./appconfig.json".
   * @returns A new JsonConfigurationSource.
   */
  static new(path?: string): JsonConfigurationSource {
    return new JsonConfigurationSource("json", path ?? this.defaultPath);
  }

  /**
   * Reads the JSON file and returns its contents as a configuration object.
   * @returns A record containing the configuration data from the JSON file as key-value pairs.
   */
  readSource(): Record<any, any> {
    return readJsonFile(this.path);
  }
}

/**
 * A {@link ConfigurationSource} that reads from a provided object.
 */
export class RawConfigurationSource implements ConfigurationSource {
  private constructor(readonly type: ConfigurationSourceType, readonly source: Record<any, any>) {}

  /**
   * Creates a new instance of {@link RawConfigurationSource}.
   * @param source - The raw configuration data as a key-value object.
   * @returns A new RawConfigurationSource.
   */
  static new(source: Record<any, any>): RawConfigurationSource {
    return new RawConfigurationSource("raw", source);
  }

  /**
   * Returns the provided raw configuration data as a key-value object.
   * @returns A record containing the raw configuration data.
   */
  readSource(): Record<any, any> {
    return this.source;
  }
}
