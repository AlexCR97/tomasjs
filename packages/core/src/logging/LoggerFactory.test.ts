import "reflect-metadata";
import { ContainerBuilder } from "@/dependency-injection";
import { LoggerFactory } from "./LoggerFactory";
import { Logger } from "./Logger";
import { ConfigurationSetup } from "@/configuration";
import { loggerSetup } from "./loggerSetup";

describe("LoggerFactory", () => {
  it("Can resolve LoggerFactory", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(loggerSetup)
      .buildServiceProvider();

    const loggerFactory = services.getOrThrow(LoggerFactory);

    expect(loggerFactory).toBeInstanceOf(LoggerFactory);
  });

  it("Can create a Logger", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(loggerSetup)
      .buildServiceProvider();

    const loggerFactory = services.getOrThrow(LoggerFactory);

    const logger = loggerFactory.createLogger("test", "debug");
    expect(logger).toBeInstanceOf(Logger);
  });
});
