import { Logger, LoggerFactory } from "@tomasjs/logging";
import { Socket } from "socket.io";
import { ConnectionListener } from "./ConnectionListener";

export class FallbackConnectionListener implements ConnectionListener {
  private readonly logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create(FallbackConnectionListener.name);
  }

  onConnection(socket: Socket) {
    this.logger.debug(`Client "${socket.id}" connected!`);
  }
}
