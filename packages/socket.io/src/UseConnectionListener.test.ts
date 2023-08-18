import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  Container,
  ContainerSetupFactory,
  ServiceContainerBuilder,
  injectable,
} from "@tomasjs/core";
import { Server, Socket as ServerSocket } from "socket.io";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { DisposeSocketIO } from "./DisposeSocketIO";
import { UseSocketIO } from "./UseSocketIO";
import { TomasLogger } from "@tomasjs/logging";
import { UseConnectionListener } from "./UseConnectionListener";
import { ConnectionListener } from "./ConnectionListener";

describe("UseConnectionListener", () => {
  const ioServerPort = 3031;
  let ioServer: Server | undefined;
  let ioServerContainer: Container | undefined;
  let clientSocket: ClientSocket | undefined;

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  // TODO Figure out why this test times out
  it.skip("Can connect a client using a ConnectionListener.", (done) => {
    const testLogger = new TomasLogger("CanUseConnectionListenerTest", "debug");

    jest.useFakeTimers();

    //@ts-ignore: Fix decorators not working in test files.
    @injectable()
    class SocketConnectionListener implements ConnectionListener {
      onConnection(socket: ServerSocket): void | Promise<void> {
        console.log("Socket connected!");
        expect(socket).toBeInstanceOf(ServerSocket);
        done(); // The test will pass if the client is connected
      }
    }

    ioServer = new Server(ioServerPort);
    testLogger.debug("Mocking server ...");
    mockServerAsync({
      server: ioServer,
      customSetup: new UseConnectionListener(SocketConnectionListener),
    }).then((container) => {
      ioServerContainer = container;
      testLogger.debug("Server mocked!");
    });

    // Wait the specified time to connect to the server
    testLogger.debug("Mocking client connection ...");
    tick(1000).then(() => {
      clientSocket = ioClient(`http://localhost:${ioServerPort}`);
      clientSocket.on("connect", () => {
        testLogger.debug("Client socket connected!");
      });
      testLogger.debug("Client connection mocked!");
    });

    jest.runAllTimers();
  });

  async function mockServerAsync(options: {
    server: Server;
    customSetup: ContainerSetupFactory;
  }): Promise<Container> {
    return await new ServiceContainerBuilder()
      .setup(
        new UseSocketIO({
          server: options.server,
          logger: new TomasLogger("Server", "debug"),
        })
      )
      .setup(options.customSetup)
      .buildContainerAsync();
  }

  async function disposeAsync() {
    clientSocket?.disconnect();

    if (ioServer && ioServerContainer) {
      const teardownFunction = new DisposeSocketIO(ioServer).create();
      await teardownFunction(ioServerContainer);
    }
  }

  async function tick(milliseconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  }
});
