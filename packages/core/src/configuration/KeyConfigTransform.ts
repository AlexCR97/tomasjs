import { Pipe } from "@/pipes";
import { Transform } from "@/transforms";
import { KeyConfiguration } from "./KeyConfiguration";
import { KeyTransform } from "./KeyTransform";

export class KeyConfigTransform<T extends Record<string, any>> implements Transform<T, T> {
  constructor(private readonly keyConfigs: KeyConfiguration<T>[]) {}

  transform(input: T): T {
    const output = this.shallowCopy(input);

    for (const keyConfig of this.keyConfigs) {
      const oldValue = output[keyConfig.key];

      const newValue = new Pipe(oldValue)
        .apply((value) => this.tryOverrideWithEnvironmentVariable(keyConfig, value))
        .apply((value) => new KeyTransform(keyConfig).transform(value))
        .apply((value) => value as T[keyof T])
        .get();

      output[keyConfig.key] = newValue;
    }

    return output;
  }

  private shallowCopy<T extends Record<string, any>>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)); // TODO Find a better way to do a shallow copy?
  }

  private tryOverrideWithEnvironmentVariable<T extends Record<string, any>>(
    { key, overrideFromEnvironment }: KeyConfiguration<T>,
    value: T[keyof T]
  ) {
    if (!overrideFromEnvironment) {
      return value;
    }
    const valueFromEnv = process.env[key as string]; // TODO Avoid using "string"
    return valueFromEnv ?? value;
  }
}
