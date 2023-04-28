// TODO Move this to @tomasjs/core

import { ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { serviceProviderToken } from "./serviceProviderToken";

export class UseServiceProvider implements ContainerSetupFactory {
  create(): ContainerSetupFunction {
    return (container) => {
      container.addInstance(container, serviceProviderToken);
    };
  }
}
