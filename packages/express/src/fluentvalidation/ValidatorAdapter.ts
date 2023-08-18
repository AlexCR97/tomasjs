import { ClassConstructor, Container, NotImplementedError } from "@tomasjs/core";
import { Validator } from "fluentvalidation-ts";

export abstract class ValidatorAdapter {
  private constructor() {}

  private static get container(): Container {
    throw new NotImplementedError("get container"); // TODO Implement
  }
  static from<TModel extends object, TValidator extends Validator<TModel> = Validator<TModel>>(
    validator: TValidator | ClassConstructor<TValidator>
  ): TValidator {
    if (validator instanceof Validator) {
      return validator;
    }

    return this.container.get(validator);
  }
}
