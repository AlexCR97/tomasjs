import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Container, ServiceContainerBuilder, inject, injectable } from "@tomasjs/core";
import { Server } from "socket.io";
import { DisposeSocketIO } from "./DisposeSocketIO";
import { UseSocketIO } from "./UseSocketIO";
import { serverToken } from "./serverToken";

describe("UseSocketIO", () => {
  const port = 3031;
  let ioServer: Server | undefined;
  let testContainer: Container | undefined;

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it(`The ${Server.name} should be retrievable via the "serverToken" after the setup.`, async () => {
    ioServer = new Server(port);

    testContainer = await new ServiceContainerBuilder()
      .setup(
        new UseSocketIO({
          server: ioServer,
        })
      )
      .buildContainerAsync();

    const server = testContainer.get<Server>(serverToken);
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

    testContainer = await new ServiceContainerBuilder()
      .setup(
        new UseSocketIO({
          server: ioServer,
        })
      )
      .setup((container) => {
        container.addClass(TestClass);
      })
      .buildContainerAsync();

    const testInstance = testContainer.get(TestClass);
    expect(testInstance).toBeTruthy();
    expect(testInstance.server).toBeTruthy();
    expect(testInstance.server).toBeInstanceOf(Server);
  });

  async function disposeAsync() {
    if (ioServer && testContainer) {
      const teardownFunction = new DisposeSocketIO(ioServer).create();
      await teardownFunction(testContainer);
    }
  }
});
