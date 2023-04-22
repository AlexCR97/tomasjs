import { ClassConstructor, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { DisconnectingListener } from "./DisconnectingListener";
import { disconnectingListenerToken } from "./disconnectingListenerToken";

export class UseDisconnectingListener extends ContainerSetupFactory {
  constructor(private readonly disconnectingListener: ClassConstructor<DisconnectingListener>) {
    super();
  }

  create(): ContainerSetup {
    return (container) => {
      container.addClass(this.disconnectingListener, { token: disconnectingListenerToken });
    };
  }
}
