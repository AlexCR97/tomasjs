import { parse } from "dotenv";
import { readFileSync } from "fs";
import { ContainerSetupFactory, ContainerSetupFunction } from "@/container";
import { TomasError } from "@/errors";
import { ConfigurationSource } from "./ConfigurationSource";
import { ConfigurationSourceError } from "./ConfigurationSourceError";
import { DotenvTransform } from "./DotenvTransform";
import { KeyConfiguration } from "./KeyConfiguration";
import { configurationToken } from "./configurationToken";

export type UseConfigurationOptions<T extends object> = {
  source?: ConfigurationSource;
  path?: string;
  keyConfigs?: KeyConfiguration<T>[];
};

export class UseConfiguration<T extends object> implements ContainerSetupFactory {
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
    const envFileBuffer = this.readFile(this.path);
    const dotenvParseOutput = parse(envFileBuffer);
    return new DotenvTransform(this.options.keyConfigs).transform(dotenvParseOutput);
  }

  private buildJsonConfigurationInstance(): Readonly<T> {
    const jsonContent = this.readFile(this.path, "utf-8");

    if (typeof jsonContent !== "string") {
      throw new TomasError("The JSON content should be a string");
    }

    return JSON.parse(jsonContent);
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
