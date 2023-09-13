import { Transform, booleanTransform } from "@/transforms";
import { KeyConfiguration } from "./KeyConfiguration";

export class KeyTransform<T extends object> implements Transform<string | undefined, any> {
  constructor(private readonly keyConfiguration: KeyConfiguration<T>) {}

  transform(input: string | undefined) {
    if (this.keyConfiguration.value !== undefined) {
      return this.keyConfiguration.value;
    }

    if (input === undefined) {
      return undefined;
    }

    if (this.keyConfiguration.type === "string") {
      return input;
    }

    if (this.keyConfiguration.type === "number") {
      return Number(input);
    }

    if (this.keyConfiguration.type === "boolean") {
      return booleanTransform(input);
    }

    return input;
  }
}
