import "reflect-metadata";
import { ILogger, LogLevel, Logger } from "./Logger";
import { ContainerBuilder } from "@/dependency-injection";
import { GLOBAL_LOGGER } from "./tokens";
import { LoggerFactory } from "./LoggerFactory";
import { ConfigurationSetup } from "@/configuration";
import { loggerSetup } from "./loggerSetup";

describe("Logger", () => {
  const logLevels: LogLevel[] = ["debug", "verbose", "info", "warn", "error"];

  function doLogs(logger: ILogger) {
    logger.debug("debug");
    logger.verbose("verbose");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");
  }

  it("Can create and use a TomasLogger", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(loggerSetup)
      .buildServiceProvider();

    const logger = services.getOrThrow<Logger>(GLOBAL_LOGGER);
    logger.debug('This is a log with "debug" level.');
    logger.verbose('This is a log with "verbose" level.');
    logger.info('This is a log with "info" level.');
    logger.warn('This is a log with "warn" level.');
    logger.error('This is a log with "error" level.');
    console.log("");
  });

  it("Can log with data", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(loggerSetup)
      .buildServiceProvider();

    const logger = services.getOrThrow<Logger>(GLOBAL_LOGGER);
    logger.debug("Log with number", 10);
    logger.debug("Log with boolean", true);
    logger.debug("Log with string", "TestString");
    logger.debug("Log with single object", { propA: "PropA", propB: "PropB" });
    logger.debug(
      "Log with multiple objects",
      { propA: "PropA", propB: "PropB" },
      { propC: "PropC", propD: "PropD" }
    );
    console.log("");
  });

  it("Can use log levels", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(loggerSetup)
      .buildServiceProvider();

    const loggerFactory = services.getOrThrow(LoggerFactory);

    for (const level of logLevels) {
      console.log("Now using level:", level);
      const logger = loggerFactory.createLogger("test", level);
      doLogs(logger);
    }
  });
});
