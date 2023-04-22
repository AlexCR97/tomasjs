import { ClassConstructor, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { ConnectionListener } from "./ConnectionListener";
import { connectionListenerToken } from "./connectionListenerToken";

export class UseConnectionListener extends ContainerSetupFactory {
  constructor(private readonly connectionListener: ClassConstructor<ConnectionListener>) {
    super();
  }

  create(): ContainerSetup {
    return (container) => {
      container.addClass(this.connectionListener, { token: connectionListenerToken });
    };
  }
}
