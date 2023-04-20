import { Validator } from "fluentvalidation-ts";
import { ValidatorInjectionTokenFactory } from "./ValidatorInjectionTokenFactory";
import { ClassConstructor, inject } from "@tomasjs/core";

export function inValidator<TValidator extends Validator<any> = Validator<any>>(
  validatorClass: ClassConstructor<TValidator>
) {
  const token = ValidatorInjectionTokenFactory.create(validatorClass);
  return inject(token);
}
