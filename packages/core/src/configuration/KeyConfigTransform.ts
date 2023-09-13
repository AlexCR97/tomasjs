import { Pipe } from "@/pipes";
import { Transform } from "@/transforms";
import { KeyConfiguration } from "./KeyConfiguration";
import { KeyTransform } from "./KeyTransform";
import { getOrDefault } from "@/reflection/get";
import { set } from "@/reflection/set";

export class KeyConfigTransform<T extends Record<string, any>> implements Transform<T, T> {
  constructor(private readonly keyConfigs: KeyConfiguration<T>[]) {}

  transform(input: T): T {
    const output = this.shallowCopy(input);

    for (const keyConfig of this.keyConfigs) {
      const oldValue = getOrDefault<string>(output, keyConfig.key as string, {
        notation: keyConfig.keyNotation,
      });

      const newValue = new Pipe(oldValue)
        .apply((value) => this.tryOverrideWithEnvironmentVariable(keyConfig, value))
        .apply((value) => new KeyTransform(keyConfig).transform(value))
        .apply((value) => value as T[keyof T])
        .get();

      set(output, keyConfig.key as string, newValue, { notation: keyConfig.keyNotation });
    }

    return output;
  }

  private shallowCopy<T extends Record<string, any>>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)); // TODO Find a better way to do a shallow copy?
  }

  private tryOverrideWithEnvironmentVariable<T extends Record<string, any>>(
    { key, overrideFromEnvironment }: KeyConfiguration<T>,
    value: string | undefined
  ): string | undefined {
    if (!overrideFromEnvironment) {
      return value;
    }
    const valueFromEnv = process.env[key as string]; // TODO Avoid using "string"
    return valueFromEnv ?? value;
  }
}
