import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Container, ServiceContainer } from "@tomasjs/core";
import { ExpressAppBuilder } from "./ExpressAppBuilder";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { Server } from "http";

describe("ExpressAppBuilder", () => {
  let server: Server | undefined;
  let container: Container | undefined;

  beforeEach(async () => {
    container = new ServiceContainer();
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it(`Can create a server using the ${ExpressAppBuilder.name}`, async () => {
    const testLogger = bootstrapLoggerFactory("debug");
    server = await new ExpressAppBuilder({ container, logger: testLogger }).buildAsync();
    expect(server).toBeInstanceOf(Server);
  });

  async function disposeAsync() {
    server?.close();
  }
});
