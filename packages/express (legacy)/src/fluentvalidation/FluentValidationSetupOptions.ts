import { ClassConstructor } from "@/container";
import { Validator } from "fluentvalidation-ts";

export interface FluentValidationSetupOptions {
  validators?: ClassConstructor<Validator<any>>[];
}
