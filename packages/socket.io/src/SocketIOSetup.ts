import { Container, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";
import { Server } from "socket.io";
import { SocketIOSetupOptions } from "./SocketIOSetupOptions";
import { ConnectionListenerResolver } from "./ConnectionListenerResolver";

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

        const connectionListenerResolver = new ConnectionListenerResolver(
          container as Container, // TODO Fix type error: Argument of type 'Container' is not assignable to parameter of type 'GlobalContainer'.
          this.logger
        );

        connectionListenerResolver.resolve().onConnection(socket);

        socket.on("disconnecting", (reason, description) => {
          this.logger?.debug(`Client "${socket.id}" is disconnecting....`);
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
}
