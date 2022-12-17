import { Validator } from "fluentvalidation-ts";
import { constructor } from "tsyringe/dist/typings/types";

export abstract class ValidatorInjectionTokenFactory {
  private constructor() {}

  static readonly prefix = "__fluentvalidation__validator__";

  static create<TValidator extends Validator<any> = Validator<any>>(
    validatorClass: constructor<TValidator>
  ): string {
    return `${this.prefix}${validatorClass.name}`;
  }
}
