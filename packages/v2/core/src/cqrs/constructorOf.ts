import { Constructor } from "@/dependency-injection/Constructor";
import { TomasError } from "@/errors/TomasError";

export function constructorOf<T>(source: unknown): Constructor<T> {
  const sourcePrototype = Object.getPrototypeOf(source);

  const sourceConstructor: Constructor<T> = sourcePrototype?.constructor;

  if (sourceConstructor === null || sourceConstructor === undefined) {
    throw new TomasError("NO_CONSTRUCTOR", "The provided source does not have a constructor.", {
      data: { source },
    });
  }

  return sourceConstructor;
}
