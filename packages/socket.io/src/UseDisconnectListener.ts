import { ClassConstructor, ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { DisconnectListener } from "./DisconnectListener";
import { disconnectListenerToken } from "./disconnectListenerToken";

export class UseDisconnectListener implements ContainerSetupFactory {
  constructor(private readonly listener: ClassConstructor<DisconnectListener>) {}

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(this.listener, { token: disconnectListenerToken });
    };
  }
}
