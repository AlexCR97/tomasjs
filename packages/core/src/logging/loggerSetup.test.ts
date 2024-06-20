import "reflect-metadata";
import { ContainerBuilder } from "@/dependency-injection";
import { Logger } from "./Logger";
import { GLOBAL_LOGGER } from "./tokens";
import { ConfigurationSetup } from "@/configuration";
import { loggerSetup } from "./loggerSetup";

describe("loggerSetup", () => {
  it("Can resolve the global Logger", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(loggerSetup)
      .buildServiceProvider();

    const logger = services.getOrThrow<Logger>(GLOBAL_LOGGER);

    expect(logger).toBeInstanceOf(Logger);
  });
});
