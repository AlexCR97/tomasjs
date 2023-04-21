import "reflect-metadata";
import { TomasLoggerFactory, bootstrapLoggerFactory } from "@tomasjs/logging";
import { io } from "socket.io-client";

const serverDomain = "http://localhost";
const serverPort = 3030;
const bootstrapLogger = bootstrapLoggerFactory();

async function main() {
  bootstrapLogger.debug("Starting client...");

  const logger = new TomasLoggerFactory().create("ClientSocket");
  const socket = io(`${serverDomain}:${serverPort}`);

  socket.on("connect", () => {
    logger.info(`connect ${socket.id}`);
  });

  socket.on("connect_error", () => {
    logger.error(`connect_error ${socket.id}`);
  });

  socket.on("disconnect", () => {
    logger.info(`disconnect ${socket.id}`);
  });

  bootstrapLogger.debug("Client started!");
}

main();
