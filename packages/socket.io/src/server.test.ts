import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { ContainerBuilder, globalContainer, inject, injectable } from "@tomasjs/core";
import { Server } from "socket.io";
import { SocketIOSetup } from "./SocketIOSetup";
import { serverToken } from "./serverToken";

describe("server", () => {
  const port = 3031;
  let ioServer: Server;

  beforeEach(() => {
    disposeResources();
  });

  afterEach(() => {
    disposeResources();
  });

  it(`The ${Server.name} should be retrievable via the "serverToken" after the setup.`, async () => {
    ioServer = new Server(port);

    await new ContainerBuilder()
      .setup(
        new SocketIOSetup({
          server: ioServer,
        })
      )
      .buildAsync();

    const server = globalContainer.get<Server>(serverToken);
    expect(server).toBeTruthy();
    expect(server).toBeInstanceOf(Server);
  });

  it(`The ${Server.name} should be retrievable via DI after the setup.`, async () => {
    ioServer = new Server(port);

    //@ts-ignore: Fix decorators not working in test files.
    @injectable()
    class TestClass {
      constructor(
        //@ts-ignore: Fix decorators not working in test files.
        @inject(serverToken) readonly server: Server
      ) {}
    }

    await new ContainerBuilder()
      .setup(
        new SocketIOSetup({
          server: ioServer,
        })
      )
      .setup((container) => {
        container.addClass(TestClass);
      })
      .buildAsync();

    const testInstance = globalContainer.get(TestClass);
    expect(testInstance).toBeTruthy();
    expect(testInstance.server).toBeTruthy();
    expect(testInstance.server).toBeInstanceOf(Server);
  });

  function disposeResources() {
    ioServer?.close();

    if (globalContainer.has(serverToken)) {
      globalContainer.remove(serverToken);
    }
  }
});
