import { ContainerSetup, ContainerSetupFactory } from "@/builder";
import { TomasError } from "@/core/errors";
import { config, DotenvConfigOptions } from "dotenv";
import { KeyConfiguration } from "./KeyConfiguration";
import { DotEnvConfiguration } from "./DotEnvConfiguration";
import { Configuration } from "../core";
import { ClassConstructor } from "@/container";
import { ConfigurationToken } from "../core/ConfigurationToken";

type DotEnvSetupOptions<TSettings extends object> = DotenvConfigOptions & {
  constructor: ClassConstructor<TSettings>;
  keyConfigurations?: KeyConfiguration<TSettings>[];
};

export class DotEnvSetup<TSettings extends object> extends ContainerSetupFactory {
  constructor(private readonly options: DotEnvSetupOptions<TSettings>) {
    super();
  }

  create(): ContainerSetup {
    return (container) => {
      const dotenvConfigOutput = config(this.options);

      if (dotenvConfigOutput.error) {
        throw new TomasError("Could not setup dotenv configuration", {
          innerError: dotenvConfigOutput.error,
        });
      }

      const configuration: Configuration<TSettings> = new DotEnvConfiguration(
        dotenvConfigOutput.parsed!,
        this.options?.keyConfigurations
      );

      container.addInstance(configuration, ConfigurationToken);
      container.addInstance(configuration.root, this.options.constructor);
    };
  }
}
