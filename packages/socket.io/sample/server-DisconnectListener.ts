import { inject, injectable } from "@tomasjs/core";
import { Logger, LoggerFactory, loggerFactoryToken } from "@tomasjs/logging";
import { DisconnectReason, Socket } from "socket.io";
import { DisconnectListener } from "../src";

//@ts-ignore: Fix decorators not working in sample files.
@injectable()
export class SocketDisconnectListener implements DisconnectListener {
  private readonly logger: Logger;

  constructor(
    //@ts-ignore: Fix decorators not working in sample files.
    @inject(loggerFactoryToken) loggerFactory: LoggerFactory
  ) {
    this.logger = loggerFactory.create(SocketDisconnectListener.name);
  }

  onDisconnect(socket: Socket, reason: DisconnectReason, description: any): void | Promise<void> {
    this.logger.info(`Client "${socket.id}" disconnected.`, { reason, description });
  }
}
