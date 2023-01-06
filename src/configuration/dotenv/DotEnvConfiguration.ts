import { TomasError } from "@/core/errors";
import { DotenvParseOutput } from "dotenv";
import { IConfiguration } from "../core";
import { KeyConfiguration } from "./KeyConfiguration";

export class DotEnvConfiguration<T extends object> implements IConfiguration<T> {
  private readonly _root: T;

  constructor(config: DotenvParseOutput, keyConfigurations?: KeyConfiguration<T>[]) {
    this._root = JSON.parse(JSON.stringify(config)); // TODO Find a better way to do a shallow copy?

    if (
      keyConfigurations !== undefined &&
      keyConfigurations !== null &&
      keyConfigurations.length > 0
    ) {
      for (const keyConfig of keyConfigurations) {
        const originalValue = this._root[keyConfig.key];
        let parsedValue: any;

        if (keyConfig.type === "string") {
          parsedValue = String(originalValue);
        } else if (keyConfig.type === "number") {
          parsedValue = Number(originalValue);
        } else if (keyConfig.type === "boolean") {
          parsedValue = Boolean(originalValue);
        } else if (keyConfig.type === "object") {
          parsedValue = originalValue;
        } else {
          throw new TomasError(`Unknown ConfigurationKeyType "${keyConfig.type}"`);
        }

        Reflect.set(this._root, keyConfig.key, parsedValue);
      }
    }
  }

  get root(): T {
    return this._root;
  }
}
