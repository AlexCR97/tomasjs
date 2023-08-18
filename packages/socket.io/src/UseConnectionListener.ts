import { ClassConstructor, ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { ConnectionListener } from "./ConnectionListener";
import { connectionListenerToken } from "./connectionListenerToken";

export class UseConnectionListener implements ContainerSetupFactory {
  constructor(private readonly connectionListener: ClassConstructor<ConnectionListener>) {}

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(this.connectionListener, { token: connectionListenerToken });
    };
  }
}
