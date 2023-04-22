import { inject } from "@tomasjs/core";
import { Logger, LoggerFactory, LoggerFactoryToken } from "@tomasjs/logging";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ConnectionListener, connectionListener } from "../src";

//@ts-ignore: Fix decorators not working in sample files.
@connectionListener()
export class SocketConnectionListener implements ConnectionListener {
  private readonly logger: Logger;

  constructor(
    //@ts-ignore: Fix decorators not working in sample files.
    @inject(LoggerFactoryToken) loggerFactory: LoggerFactory
  ) {
    this.logger = loggerFactory.create(SocketConnectionListener.name);
  }

  onConnection(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ): void | Promise<void> {
    this.logger.info(`Client "${socket.id}" connected!`);

    // Disconnect after the specified milliseconds
    const timeout = 3000;
    this.logger.info(`The client will be disconnected in ${timeout} milliseconds.`);
    setTimeout(() => socket.disconnect(true), timeout);
  }
}
