import "reflect-metadata";
import { describe, beforeEach, afterEach, it, expect } from "@jest/globals";
import { Container, ServiceContainerBuilder } from "@tomasjs/core";
import { TomasLogger } from "@tomasjs/logging";
import { DisposeAmqplib } from "./DisposeAmqplib";
import { UseAmqplib } from "./UseAmqplib";

describe("UseAmqplib", () => {
  let testContainer: Container;
  const logger = new TomasLogger("UseAmqplib", "debug");
  const url = "amqp://localhost";

  beforeEach(async () => {
    await tryDisposeConnectionAsync();
  });

  afterEach(async () => {
    await tryDisposeConnectionAsync();
  });

  it("Can use UseAmqplib to connect to bootstrap amqplib", (done) => {
    new ServiceContainerBuilder()
      .setup(
        new UseAmqplib({
          url,
          logger,
          onConnected(connection) {
            expect(connection).toBeTruthy();
          },
          onDefaultChannelOpened(channel) {
            expect(channel).toBeTruthy();
          },
          onBootstrapped(connection, channel) {
            expect(connection).toBeTruthy();
            expect(channel).toBeTruthy();
            done(); // Test will pass if amqplib was bootstrapped.
          },
        })
      )
      .buildContainerAsync()
      .then((container) => {
        testContainer = container;
      });
  });

  async function tryDisposeConnectionAsync() {
    if (!testContainer) {
      return;
    }

    const teardownFunction = new DisposeAmqplib({ logger }).create();
    await teardownFunction(testContainer);
  }
});
