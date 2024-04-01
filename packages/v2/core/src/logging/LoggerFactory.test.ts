import "reflect-metadata";
import { ContainerBuilder } from "@/dependency-injection/Container";
import { LoggerFactory } from "./LoggerFactory";
import { Logger } from "./Logger";

describe("LoggerFactory", () => {
  it("Can resolve LoggerFactory", async () => {
    const services = await new ContainerBuilder()
      .addConfiguration()
      .addLogging()
      .buildServiceProvider();

    const loggerFactory = services.getOrThrow(LoggerFactory);

    expect(loggerFactory).toBeInstanceOf(LoggerFactory);
  });

  it("Can create a Logger", async () => {
    const services = await new ContainerBuilder()
      .addConfiguration()
      .addLogging()
      .buildServiceProvider();

    const loggerFactory = services.getOrThrow(LoggerFactory);

    const logger = loggerFactory.createLogger("test", "debug");
    expect(logger).toBeInstanceOf(Logger);
  });
});
