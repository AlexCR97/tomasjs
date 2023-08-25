import { parse } from "dotenv";
import { ContainerSetupFactory, ContainerSetupFunction } from "@/container";
import { TomasError } from "@/errors";
import { KeyConfiguration } from "./KeyConfiguration";
import { configurationToken } from "./configurationToken";
import { DotenvTransform } from "./DotenvConfiguration";
import { readFileSync } from "fs";

export type UseConfigurationOptions<T extends object> = {
  path?: string;
  keyConfigs?: KeyConfiguration<T>[];
};

export class UseConfiguration<T extends object> implements ContainerSetupFactory {
  constructor(private readonly options: UseConfigurationOptions<T>) {}

  private get path(): string {
    return this.options.path ?? ".env";
  }

  create(): ContainerSetupFunction {
    return (container) => {
      const envFile = this.readFile(this.path);
      const dotenvParseOutput = parse(envFile);
      const configurationInstance = new DotenvTransform(this.options.keyConfigs).transform(
        dotenvParseOutput
      );
      container.addInstance(configurationInstance, configurationToken);
    };
  }

  private readFile(path: string): Buffer {
    try {
      return readFileSync(path);
    } catch (err) {
      throw new TomasError(`Could not find file at path "${path}"`, {
        data: { path },
        innerError: err,
      });
    }
  }
}
