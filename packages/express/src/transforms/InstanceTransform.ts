import { ClassConstructor, Transform, TransformError } from "@tomasjs/core";
import { plainToClass, Type } from "class-transformer";

export function transformType<T extends object = object>(classConstructor: ClassConstructor<T>) {
  return Type(() => classConstructor);
}

export class InstanceTransform<T> implements Transform<object, T> {
  constructor(private readonly classConstructor: ClassConstructor<T>) {}

  transform(input: object): T {
    try {
      return plainToClass(this.classConstructor, input);
    } catch (err) {
      throw new TransformError(input, InstanceTransform.name, err);
    }
  }
}
