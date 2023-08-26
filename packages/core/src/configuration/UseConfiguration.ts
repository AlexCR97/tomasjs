import { parse } from "dotenv";
import { readFileSync } from "fs";
import { ContainerSetupFactory, ContainerSetupFunction } from "@/container";
import { TomasError } from "@/errors";
import { ConfigurationSource } from "./ConfigurationSource";
import { ConfigurationSourceError } from "./ConfigurationSourceError";
import { KeyConfigTransform } from "./KeyConfigTransform";
import { KeyConfiguration } from "./KeyConfiguration";
import { configurationToken } from "./configurationToken";
import { Pipe } from "@/pipes";

export type UseConfigurationOptions<T extends Record<string, any>> = {
  source?: ConfigurationSource;
  path?: string;
  keyConfigs?: KeyConfiguration<T>[];
};

export class UseConfiguration<T extends Record<string, any>> implements ContainerSetupFactory {
  private readonly defaultSource: ConfigurationSource = ".env";
  private readonly defaultEnvPath = ".env";
  private readonly defaultJsonPath = "app.config.json";

  constructor(private readonly options: UseConfigurationOptions<T>) {}

  private get source(): ConfigurationSource {
    return this.options.source ?? this.defaultSource;
  }

  private get path(): string {
    if (this.options.path !== undefined) {
      return this.options.path;
    }

    if (this.source === ".env") {
      return this.defaultEnvPath;
    }

    if (this.source === "json") {
      return this.defaultJsonPath;
    }

    throw new ConfigurationSourceError(this.source);
  }

  private get keyConfigs(): KeyConfiguration<T>[] {
    return this.options.keyConfigs ?? [];
  }

  create(): ContainerSetupFunction {
    return (container) => {
      const configurationInstance = this.buildConfigurationInstance();
      container.addInstance(configurationInstance, configurationToken);
    };
  }

  private buildConfigurationInstance(): Readonly<T> {
    if (this.source === ".env") {
      return this.buildEnvConfigurationInstance();
    }

    if (this.source === "json") {
      return this.buildJsonConfigurationInstance();
    }

    throw new ConfigurationSourceError(this.source);
  }

  private buildEnvConfigurationInstance(): Readonly<T> {
    return new Pipe(this.path)
      .apply((path) => this.readFile(path))
      .apply((envFile) => parse(envFile))
      .apply((dotenvParseOutput) => {
        return new KeyConfigTransform(this.keyConfigs).transform(dotenvParseOutput as any); // TODO Avoid using "any"
      })
      .get();
  }

  private buildJsonConfigurationInstance(): Readonly<T> {
    return new Pipe(this.path)
      .apply((path) => this.readFile(path, "utf-8") as string)
      .apply((jsonContent) => JSON.parse(jsonContent))
      .apply((json) => {
        return new KeyConfigTransform(this.keyConfigs).transform(json);
      })
      .get();
  }

  private readFile(path: string, encoding?: BufferEncoding) {
    try {
      return readFileSync(path, encoding);
    } catch (err) {
      throw new TomasError(`Could not find file at path "${path}"`, {
        data: { path },
        innerError: err,
      });
    }
  }
}
