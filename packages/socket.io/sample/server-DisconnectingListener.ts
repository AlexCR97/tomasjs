import { inject, injectable } from "@tomasjs/core";
import { Logger, LoggerFactory, loggerFactoryToken } from "@tomasjs/logging";
import { DisconnectReason, Socket } from "socket.io";
import { DisconnectingListener } from "../src";

//@ts-ignore: Fix decorators not working in sample files.
@injectable()
export class SocketDisconnectingListener implements DisconnectingListener {
  private readonly logger: Logger;

  constructor(
    //@ts-ignore: Fix decorators not working in sample files.
    @inject(loggerFactoryToken) loggerFactory: LoggerFactory
  ) {
    this.logger = loggerFactory.create(SocketDisconnectingListener.name);
  }

  onDisconnecting(
    socket: Socket,
    reason: DisconnectReason,
    description: any
  ): void | Promise<void> {
    this.logger.info(`Client "${socket.id}" disconnecting ...`, { reason, description });
  }
}
