import { Transform } from "@/transforms";
import { Configuration } from "./Configuration";
import { KeyConfiguration } from "./KeyConfiguration";
import { KeyTransform } from "./KeyTransform";

export class JsonTransform<T extends object> implements Transform<string, Configuration<T>> {
  constructor(private readonly keyConfigurations?: KeyConfiguration<T>[]) {}

  transform(input: string): Readonly<T> {
    const output = JSON.parse(input);

    if (
      this.keyConfigurations === undefined ||
      this.keyConfigurations === null ||
      this.keyConfigurations.length === 0
    ) {
      return output;
    }

    for (const keyConfig of this.keyConfigurations) {
      // TODO Clean this code

      if (keyConfig.overrideFromEnvironment === true) {
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
    }

    return output;
  }
}
