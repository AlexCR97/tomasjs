import { ClassConstructor, globalContainer } from "@tomasjs/core";
import { Validator } from "fluentvalidation-ts";

export abstract class ValidatorAdapter {
  private constructor() {}

  static from<TModel extends object, TValidator extends Validator<TModel> = Validator<TModel>>(
    validator: TValidator | ClassConstructor<TValidator>
  ): TValidator {
    if (validator instanceof Validator) {
      return validator;
    }

    return globalContainer.get(validator);
  }
}
