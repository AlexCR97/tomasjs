import { ClassConstructor } from "@/container";
import { TomasError } from "../errors";

export function getConstructorOf<T>(source: any): ClassConstructor<T> {
  const sourcePrototype = Object.getPrototypeOf(source);

  const sourceConstructor: ClassConstructor<T> = sourcePrototype?.constructor;

  if (!sourceConstructor) {
    throw new TomasError("The provided source does not have a constructor.", {
      data: { source },
    });
  }

  return sourceConstructor;
}
