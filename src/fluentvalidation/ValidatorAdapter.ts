import { Validator } from "fluentvalidation-ts";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";

export abstract class ValidatorAdapter {
  private constructor() {}

  static from<TModel extends object, TValidator extends Validator<TModel> = Validator<TModel>>(
    validator: TValidator | constructor<TValidator>
  ): TValidator {
    if (validator instanceof Validator) {
      return validator;
    }

    return container.resolve(validator);
  }
}
