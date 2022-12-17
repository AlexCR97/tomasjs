import { Validator } from "fluentvalidation-ts";
import { inject } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ValidatorInjectionTokenFactory } from "./ValidatorInjectionTokenFactory";

export function inValidator<TValidator extends Validator<any> = Validator<any>>(
  validatorClass: constructor<TValidator>
) {
  const token = ValidatorInjectionTokenFactory.create(validatorClass);
  return inject(token);
}
