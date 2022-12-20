import { ClassConstructor, inject } from "@/container";
import { Validator } from "fluentvalidation-ts";
import { ValidatorInjectionTokenFactory } from "./ValidatorInjectionTokenFactory";

export function inValidator<TValidator extends Validator<any> = Validator<any>>(
  validatorClass: ClassConstructor<TValidator>
) {
  const token = ValidatorInjectionTokenFactory.create(validatorClass);
  return inject(token);
}
