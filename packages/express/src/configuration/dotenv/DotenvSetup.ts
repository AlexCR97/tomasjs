import {
  ClassConstructor,
  Configuration,
  ConfigurationToken,
  ContainerSetupFactory,
  ContainerSetupFunction,
  TomasError,
} from "@tomasjs/core";
import { config, DotenvConfigOptions } from "dotenv";
import { KeyConfiguration } from "./KeyConfiguration";
import { DotenvConfiguration } from "./DotenvConfiguration";

type DotenvSetupOptions<TSettings extends object> = DotenvConfigOptions & {
  constructor: ClassConstructor<TSettings>;
  keyConfigurations?: KeyConfiguration<TSettings>[];
};

export class DotenvSetup<TSettings extends object> implements ContainerSetupFactory {
  constructor(private readonly options: DotenvSetupOptions<TSettings>) {}

  create(): ContainerSetupFunction {
    return (container) => {
      const dotenvConfigOutput = config(this.options);

      if (dotenvConfigOutput.error) {
        throw new TomasError("Could not setup dotenv configuration", {
          innerError: dotenvConfigOutput.error,
        });
      }

      const configuration: Configuration<TSettings> = new DotenvConfiguration(
        dotenvConfigOutput.parsed!,
        this.options?.keyConfigurations
      );

      container.addInstance(configuration, ConfigurationToken);
      container.addInstance(configuration.root, this.options.constructor);
    };
  }
}
