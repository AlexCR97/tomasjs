import { Container, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";
import { DisconnectReason, Server, Socket } from "socket.io";
import { SocketIOSetupOptions } from "./SocketIOSetupOptions";
import { ConnectionListenerResolver } from "./ConnectionListenerResolver";
import { DisconnectingListenerResolver } from "./DisconnectingListenerResolver";

export class SocketIOSetup extends ContainerSetupFactory {
  constructor(private readonly options: SocketIOSetupOptions) {
    super();
  }

  private get port(): number | undefined {
    return this.options.port;
  }

  private get server(): Server {
    return this.options.server;
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): ContainerSetup {
    return (container) => {
      this.logger?.debug("Started setup for socket.io server ...");

      this.server.on("connection", (socket) => {
        this.logger?.debug(`A socket has connected (${socket.id}).`);
        // TODO Fix type error: Argument of type 'Container' is not assignable to parameter of type 'GlobalContainer'.
        this.delegateToConnectionListener(container as Container, socket);

        socket.on("disconnecting", (reason, description) => {
          this.logger?.debug(`A socket is disconnecting (${socket.id}) ...`);
          // TODO Fix type error: Argument of type 'Container' is not assignable to parameter of type 'GlobalContainer'.
          this.delegateToDisconnectingListener(container as Container, socket, reason, description);
        });

        socket.on("disconnect", (reason, description) => {
          this.logger?.debug(`Client "${socket.id}" disconnected.`);
        });
      });

      if (this.port !== undefined && this.port !== null) {
        this.logger?.debug("The port has been defined explicitly.");
        this.server.listen(this.port);
      }

      this.logger?.debug("The setup for socket.io server has finished.");
    };
  }

  private delegateToConnectionListener(container: Container, socket: Socket) {
    const resolver = new ConnectionListenerResolver(container, this.logger);
    const listener = resolver.resolve();
    listener.onConnection(socket);
  }

  private delegateToDisconnectingListener(
    container: Container,
    socket: Socket,
    reason: DisconnectReason,
    description: any
  ) {
    const resolver = new DisconnectingListenerResolver(container, this.logger);
    const listener = resolver.resolve();
    listener.onDisconnecting(socket, reason, description);
  }
}
