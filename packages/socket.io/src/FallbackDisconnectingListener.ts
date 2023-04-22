import { Logger, LoggerFactory } from "@tomasjs/logging";
import { DisconnectReason, Socket } from "socket.io";
import { DisconnectingListener } from "./DisconnectingListener";

export class FallbackDisconnectingListener implements DisconnectingListener {
  private readonly logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create(FallbackDisconnectingListener.name);
  }

  onDisconnecting(
    socket: Socket,
    reason: DisconnectReason,
    description: any
  ): void | Promise<void> {
    this.logger.debug(`Client "${socket.id}" is disconnecting ...`, { reason, description });
  }
}
