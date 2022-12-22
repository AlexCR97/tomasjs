import { ContainerSetup, ContainerSetupFactory } from "@/builder";
import { FluentValidationSetupOptions } from "./FluentValidationSetupOptions";
import { ValidatorInjectionTokenFactory } from "./ValidatorInjectionTokenFactory";

export class FluentValidationSetup extends ContainerSetupFactory {
  constructor(private readonly options: FluentValidationSetupOptions) {
    super();
  }

  create(): ContainerSetup {
    return (container) => {
      if (
        this.options.validators !== undefined &&
        this.options.validators !== null &&
        this.options.validators.length > 0
      ) {
        for (const validator of this.options.validators) {
          const token = ValidatorInjectionTokenFactory.create(validator);
          container.addClass(validator, token);
        }
      }
    };
  }
}
