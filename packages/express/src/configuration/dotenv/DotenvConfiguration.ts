import { Configuration, TomasError, Transform, TransformFunction } from "@tomasjs/core";
import { DotenvParseOutput } from "dotenv";
import { KeyConfiguration } from "./KeyConfiguration";

export class DotenvConfiguration<TSettings extends object> implements Configuration<TSettings> {
  private readonly _root: TSettings;

  constructor(config: DotenvParseOutput, keyConfigurations?: KeyConfiguration<TSettings>[]) {
    const dotenvTransform = new DotenvTransform(keyConfigurations);
    this._root = dotenvTransform.transform(config);
  }

  get root(): TSettings {
    return this._root;
  }
}

class DotenvTransform<TObject extends object> implements Transform<DotenvParseOutput, TObject> {
  constructor(private readonly keyConfigurations?: KeyConfiguration<TObject>[]) {}

  transform(input: DotenvParseOutput): TObject {
    const output = JSON.parse(JSON.stringify(input)); // TODO Find a better way to do a shallow copy?

    if (
      this.keyConfigurations === undefined ||
      this.keyConfigurations === null ||
      this.keyConfigurations.length === 0
    ) {
      return output;
    }

    for (const keyConfig of this.keyConfigurations) {
      const keyConfigTransform = new KeyConfigurationTransform<TObject>(keyConfig);
      const transformInput = output[keyConfig.key];
      const transformOutput = keyConfigTransform.transform(transformInput);
      Reflect.set(output, keyConfig.key, transformOutput);
    }

    return output;
  }
}

type PropertyOf<T> = T[keyof T];

class KeyConfigurationTransform<TObject extends object>
  implements Transform<PropertyOf<TObject>, any>
{
  constructor(private readonly keyConfiguration: KeyConfiguration<TObject>) {}

  transform(input: PropertyOf<TObject>) {
    if (this.keyConfiguration.type === "string") {
      return String(input);
    }

    if (this.keyConfiguration.type === "number") {
      return Number(input);
    }

    if (this.keyConfiguration.type === "boolean") {
      return booleanTransform(input as string);
    }

    if (this.keyConfiguration.type === "object") {
      return input;
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
