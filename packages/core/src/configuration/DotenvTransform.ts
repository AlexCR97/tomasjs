import { DotenvParseOutput } from "dotenv";
import { Transform } from "@/transforms";
import { Configuration } from "./Configuration";
import { KeyConfiguration } from "./KeyConfiguration";
import { KeyTransform } from "./KeyTransform";

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

      const transformOutput = new KeyTransform(keyConfig).transform(transformInput);
      Reflect.set(output, keyConfig.key, transformOutput);
    }

    return output as T; // TODO Figure out a better way to do this?
  }
}
