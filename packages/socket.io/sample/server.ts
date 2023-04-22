import "reflect-metadata";
import { ContainerBuilder } from "@tomasjs/core";
import {
  TomasLoggerFactory,
  TomasLoggerFactorySetup,
  bootstrapLoggerFactory,
} from "@tomasjs/logging";
import { Server } from "socket.io";
import { SocketIOSetup, UseConnectionListener, UseDisconnectingListener } from "../src";
import { SocketConnectionListener } from "./server-ConnectionListener";
import { SocketDisconnectingListener } from "./server-DisconnectingListener";

const serverPort = 3030;
const bootstrapLogger = bootstrapLoggerFactory();
const loggerFactory = new TomasLoggerFactory();

async function main() {
  bootstrapLogger.debug("Starting server...");

  await new ContainerBuilder()
    .setup(new TomasLoggerFactorySetup())
    .setup(
      new SocketIOSetup({
        server: new Server(serverPort),
        logger: loggerFactory.create(SocketIOSetup.name),
      })
    )
    .setup(new UseConnectionListener(SocketConnectionListener))
    .setup(new UseDisconnectingListener(SocketDisconnectingListener))
    .buildAsync();

  bootstrapLogger.debug("Server started!");
}

main();
