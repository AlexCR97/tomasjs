import { Container, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { Logger, TomasLoggerFactory } from "@tomasjs/logging";
import { DisconnectReason, Server, Socket } from "socket.io";
import { SocketIOSetupOptions } from "./SocketIOSetupOptions";
import { ServiceResolver } from "./ServiceResolver";
import { disconnectListenerToken } from "./disconnectListenerToken";
import { FallbackDisconnectListener } from "./FallbackDisconnectListener";
import { connectionListenerToken } from "./connectionListenerToken";
import { FallbackConnectionListener } from "./FallbackConnectionListener";
import { disconnectingListenerToken } from "./disconnectingListenerToken";
import { FallbackDisconnectingListener } from "./FallbackDisconnectingListener";

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
        // TODO Fix type error: Argument of type 'Container' is not assignable to parameter of type 'GlobalContainer'.
        this.manageSocketConnection(container as Container, socket);
      });

      if (this.port !== undefined && this.port !== null) {
        this.logger?.debug("The port has been defined explicitly.");
        this.server.listen(this.port);
      }

      this.logger?.debug("The setup for socket.io server has finished.");
    };
  }

  private manageSocketConnection(container: Container, socket: Socket) {
    this.logger?.debug(`A socket has connected (${socket.id}).`);
    this.delegateToConnectionListener(container, socket);

    socket.on("disconnecting", (reason, description) => {
      this.logger?.debug(`A socket is disconnecting (${socket.id}) ...`);
      this.delegateToDisconnectingListener(container, socket, reason, description);
    });

    socket.on("disconnect", (reason, description) => {
      this.logger?.debug(`A socket has disconnected (${socket.id}).`);
      this.delegateToDisconnectListener(container, socket, reason, description);
    });
  }

  private delegateToConnectionListener(container: Container, socket: Socket) {
    const resolver = new ServiceResolver(container, this.logger);
    const listener = resolver.resolveOrFallback(
      connectionListenerToken,
      new FallbackConnectionListener(new TomasLoggerFactory())
    );
    listener.onConnection(socket);
  }

  private delegateToDisconnectingListener(
    container: Container,
    socket: Socket,
    reason: DisconnectReason,
    description: any
  ) {
    const resolver = new ServiceResolver(container, this.logger);
    const listener = resolver.resolveOrFallback(
      disconnectingListenerToken,
      new FallbackDisconnectingListener(new TomasLoggerFactory())
    );
    listener.onDisconnecting(socket, reason, description);
  }

  private delegateToDisconnectListener(
    container: Container,
    socket: Socket,
    reason: DisconnectReason,
    description: any
  ) {
    const resolver = new ServiceResolver(container, this.logger);
    const listener = resolver.resolveOrFallback(
      disconnectListenerToken,
      new FallbackDisconnectListener(new TomasLoggerFactory())
    );
    listener.onDisconnect(socket, reason, description);
  }
}
