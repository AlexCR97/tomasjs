import { ClassConstructor, ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { DisconnectingListener } from "./DisconnectingListener";
import { disconnectingListenerToken } from "./disconnectingListenerToken";

export class UseDisconnectingListener implements ContainerSetupFactory {
  constructor(private readonly disconnectingListener: ClassConstructor<DisconnectingListener>) {}

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(this.disconnectingListener, { token: disconnectingListenerToken });
    };
  }
}
