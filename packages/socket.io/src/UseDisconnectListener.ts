import { ClassConstructor, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { DisconnectListener } from "./DisconnectListener";
import { disconnectListenerToken } from "./disconnectListenerToken";

export class UseDisconnectListener extends ContainerSetupFactory {
  constructor(private readonly listener: ClassConstructor<DisconnectListener>) {
    super();
  }

  create(): ContainerSetup {
    return (container) => {
      container.addClass(this.listener, { token: disconnectListenerToken });
    };
  }
}
