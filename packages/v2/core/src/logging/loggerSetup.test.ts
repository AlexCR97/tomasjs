import "reflect-metadata";
import { ContainerBuilder } from "@/dependency-injection";
import { Logger } from "./Logger";
import { GLOBAL_LOGGER } from "./tokens";

describe("loggerSetup", () => {
  it("Can resolve the global Logger", async () => {
    const services = await new ContainerBuilder()
      .addConfiguration()
      .addLogging()
      .buildServiceProvider();

    const logger = services.getOrThrow<Logger>(GLOBAL_LOGGER);

    expect(logger).toBeInstanceOf(Logger);
  });
});
