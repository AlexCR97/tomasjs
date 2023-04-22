import { Logger, LoggerFactory } from "@tomasjs/logging";
import { DisconnectReason, Socket } from "socket.io";
import { DisconnectListener } from "./DisconnectListener";

export class FallbackDisconnectListener implements DisconnectListener {
  private readonly logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create(FallbackDisconnectListener.name);
  }

  onDisconnect(socket: Socket, reason: DisconnectReason, description: any) {
    this.logger.debug(`Client "${socket.id}" has disconnected.`, { reason, description });
  }
}
