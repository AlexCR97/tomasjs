import { DotenvParseOutput } from "dotenv";
import { KeyConfiguration } from "./KeyConfiguration";
import { Transform, TransformFunction } from "@/transforms";
import { TomasError } from "@/errors";
import { Configuration } from "./Configuration";

export class DotenvTransform<T extends object>
  implements Transform<DotenvParseOutput, Configuration<T>>
{
  constructor(private readonly keyConfigurations?: KeyConfiguration<T>[]) {}

  transform(input: DotenvParseOutput): Configuration<T> {
    const output: DotenvParseOutput = JSON.parse(JSON.stringify(input)); // TODO Find a better way to do a shallow copy?

    if (
      this.keyConfigurations === undefined ||
      this.keyConfigurations === null ||
      this.keyConfigurations.length === 0
    ) {
      return output as T; // TODO Figure out a better way to do this?
    }

    for (const keyConfig of this.keyConfigurations) {
      // TODO Clean this code

      let transformInput = output[keyConfig.key as any]; // TODO Avoid using "any"

      if (keyConfig.overrideFromEnvironment === true) {
        const valueFromEnv = process.env[keyConfig.key as any]; // TODO Avoid using "any"

        if (valueFromEnv !== undefined && valueFromEnv !== null) {
          transformInput = valueFromEnv;
        }
      }

      if (transformInput === undefined || transformInput === null) {
        continue;
      }

      const transformOutput = new KeyConfigurationTransform(keyConfig).transform(transformInput);
      Reflect.set(output, keyConfig.key, transformOutput);
    }

    return output as T; // TODO Figure out a better way to do this?
  }
}

class KeyConfigurationTransform<T extends object> implements Transform<string, any> {
  constructor(private readonly keyConfiguration: KeyConfiguration<T>) {}

  transform(input: string) {
    if (this.keyConfiguration.type === "string") {
      return input;
    }

    if (this.keyConfiguration.type === "number") {
      return Number(input);
    }

    if (this.keyConfiguration.type === "boolean") {
      return booleanTransform(input as string);
    }

    throw new TomasError(`Unknown KeyConfiguration ${this.keyConfiguration.type}`);
  }
}

const booleanTransform: TransformFunction<string, boolean> = (input) => {
  if (input === "true") {
    return true;
  }

  if (input === "false") {
    return false;
  }

  throw new TomasError(`Unknown boolean value "${input}"`);
};
