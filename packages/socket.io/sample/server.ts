import "reflect-metadata";
import { ContainerBuilder } from "@tomasjs/core";
import { TomasLoggerFactory, bootstrapLoggerFactory } from "@tomasjs/logging";
import { Server } from "socket.io";
import { SocketIOSetup } from "../src";

const serverPort = 3030;
const bootstrapLogger = bootstrapLoggerFactory();
const loggerFactory = new TomasLoggerFactory();

async function main() {
  bootstrapLogger.debug("Starting server...");

  await new ContainerBuilder()
    .setup(
      new SocketIOSetup({
        server: new Server(serverPort),
        logger: loggerFactory.create(SocketIOSetup.name),
      })
    )
    .buildAsync();

  bootstrapLogger.debug("Server started!");
}

main();
