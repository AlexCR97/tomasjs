import { TomasError } from "@/errors";
import { Constructor } from "./Constructor";

export function constructorOf<T>(source: unknown): Constructor<T> {
  const sourcePrototype = Object.getPrototypeOf(source);

  const sourceConstructor: Constructor<T> = sourcePrototype?.constructor;

  if (sourceConstructor === null || sourceConstructor === undefined) {
    throw new TomasError(
      "core/system/NoConstructor",
      "The provided source does not have a constructor.",
      {
        data: { source },
      }
    );
  }

  return sourceConstructor;
}
