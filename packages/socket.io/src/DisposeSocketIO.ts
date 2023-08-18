import { ContainerTeardownFactory, ContainerTeardownFunction } from "@tomasjs/core";
import { Server } from "socket.io";
import { serverToken } from "./serverToken";
import { connectionListenerToken } from "./connectionListenerToken";
import { disconnectListenerToken } from "./disconnectListenerToken";
import { disconnectingListenerToken } from "./disconnectingListenerToken";

export class DisposeSocketIO implements ContainerTeardownFactory {
  constructor(private readonly server: Server) {}

  create(): ContainerTeardownFunction {
    return (container) => {
      this.server.disconnectSockets(true);
      this.server.close();

      if (container.has(disconnectListenerToken)) {
        container.remove(disconnectListenerToken);
      }

      if (container.has(disconnectingListenerToken)) {
        container.remove(disconnectingListenerToken);
      }

      if (container.has(connectionListenerToken)) {
        container.remove(connectionListenerToken);
      }

      if (container.has(serverToken)) {
        container.remove(serverToken);
      }
    };
  }
}
