import "reflect-metadata";
import {
  TomasLoggerFactory,
  TomasLoggerFactorySetup,
  bootstrapLoggerFactory,
} from "@tomasjs/logging";
import { Server } from "socket.io";
import {
  UseConnectionListener,
  UseDisconnectListener,
  UseDisconnectingListener,
  UseSocketIO,
} from "../src";
import { SocketConnectionListener } from "./server-ConnectionListener";
import { SocketDisconnectingListener } from "./server-DisconnectingListener";
import { SocketDisconnectListener } from "./server-DisconnectListener";
import { ServiceContainerBuilder } from "@tomasjs/core";

const serverPort = 3030;
const bootstrapLogger = bootstrapLoggerFactory();
const loggerFactory = new TomasLoggerFactory();

async function main() {
  bootstrapLogger.debug("Starting server...");

  await new ServiceContainerBuilder()
    .setup(new TomasLoggerFactorySetup())
    .setup(
      new UseSocketIO({
        server: new Server(serverPort),
        logger: loggerFactory.create(UseSocketIO.name),
      })
    )
    .setup(new UseConnectionListener(SocketConnectionListener))
    .setup(new UseDisconnectingListener(SocketDisconnectingListener))
    .setup(new UseDisconnectListener(SocketDisconnectListener))
    .buildServiceProviderAsync();

  bootstrapLogger.debug("Server started!");
}

main();
