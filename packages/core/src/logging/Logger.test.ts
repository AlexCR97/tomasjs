import "reflect-metadata";
import { ILogger, LogLevel } from "./Logger";
import { ContainerBuilder } from "@/dependency-injection";
import { ConfigurationSetup } from "@/configuration";
import { LOGGER, LOGGER_BUILDER } from "./tokens";
import { ILoggerBuilder } from "./LoggerBuilder";
import { LoggerSetup } from "./LoggerSetupp";

describe("Logger", () => {
  const logLevels: LogLevel[] = ["debug", "verbose", "info", "warn", "error"];

  function doLogs(logger: ILogger) {
    logger.debug("debug");
    logger.verbose("verbose");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");
  }

  it("Can use the global Logger", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const logger = services.getOrThrow<ILogger>(LOGGER);
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
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const logger = services.getOrThrow<ILogger>(LOGGER);
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
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const loggerBuilder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);

    for (const level of logLevels) {
      console.log("Now using level:", level);
      const logger = loggerBuilder.withCategory("test").withLevel(level).build();
      doLogs(logger);
    }
  });
});
