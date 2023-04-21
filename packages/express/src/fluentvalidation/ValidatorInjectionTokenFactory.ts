import { ClassConstructor } from "@tomasjs/core";
import { Validator } from "fluentvalidation-ts";

export abstract class ValidatorInjectionTokenFactory {
  private constructor() {}

  static readonly prefix = "__fluentvalidation__validator__";

  static create<TValidator extends Validator<any> = Validator<any>>(
    validatorClass: ClassConstructor<TValidator>
  ): string {
    return `${this.prefix}${validatorClass.name}`;
  }
}
