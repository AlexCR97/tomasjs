import { Validator } from "fluentvalidation-ts";
import { constructor } from "tsyringe/dist/typings/types";

export interface FluentValidationSetupOptions {
  validators?: constructor<Validator<any>>[];
}
