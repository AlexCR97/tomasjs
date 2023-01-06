import { ContainerSetup, ContainerSetupFactory } from "@/builder";
import { TomasError } from "@/core/errors";
import { config, DotenvConfigOptions } from "dotenv";
import { KeyConfiguration } from "./KeyConfiguration";
import { DotEnvConfiguration } from "./DotEnvConfiguration";
import { IConfiguration } from "../core";

type DotEnvSetupOptions<T extends object> = DotenvConfigOptions & {
  keyConfigurations?: KeyConfiguration<T>[];
};

export class DotEnvSetup<T extends object> extends ContainerSetupFactory {
  constructor(private readonly options?: DotEnvSetupOptions<T>) {
    super();
  }

  create(): ContainerSetup {
    return (container) => {
      const configOutput = config(this.options);

      if (configOutput.error) {
        console.log("error", configOutput.error);
        throw new TomasError("Could not setup configuration", {
          innerError: configOutput.error,
        });
      }

      console.log("parsed", configOutput.parsed);

      const configuration: IConfiguration<T> = new DotEnvConfiguration(
        configOutput.parsed!,
        this.options?.keyConfigurations
      );

      console.log("configuration", configuration);
      // TODO Register Configuration singleton

      container.addInstance(configuration, "IConfiguration");
    };
  }
}
