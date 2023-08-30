import { KeyConfiguration } from "./KeyConfiguration";
import { Transform, booleanTransform } from "@/transforms";

export class KeyTransform<T extends object> implements Transform<string, any> {
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

    return input;
  }
}
