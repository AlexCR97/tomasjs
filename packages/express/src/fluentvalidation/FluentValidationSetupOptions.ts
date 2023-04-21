import { ClassConstructor } from "@tomasjs/core";
import { Validator } from "fluentvalidation-ts";

export interface FluentValidationSetupOptions {
  validators?: ClassConstructor<Validator<any>>[];
}
