import "reflect-metadata";
import { ILogger } from "./Logger";
import { ContainerBuilder } from "@/dependency-injection";
import { ConfigurationSetup } from "@/configuration";
import { LOGGER, LOGGER_BUILDER } from "./tokens";
import { ILoggerBuilder } from "./LoggerBuilder";
import { LoggerSetup } from "./LoggerSetupp";
import { LOG_LEVELS } from "./LogLevel";

describe("logging/Logger", () => {
  it("Can use the default Logger", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const logger = services.getOrThrow<ILogger>(LOGGER);
    logger.verbose('This is a log with "verbose" level.');
    logger.debug('This is a log with "debug" level.');
    logger.info('This is a log with "info" level.');
    logger.warn('This is a log with "warn" level.');
    logger.error('This is a log with "error" level.');
    logger.fatal('This is a log with "fatal" level.');
    process.stdout.write("\n");
  });

  it("Can log with data", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const logger = services.getOrThrow<ILogger>(LOGGER);
    logger.debug("Log with number {value}", { value: 10 });
    logger.debug("Log with boolean {value}", { value: true });
    logger.debug("Log with string {value}", { value: "foo" });
    logger.debug("Log with object {value}", { value: { foo: "bar", fizz: "buzz" } });
    logger.debug("Log with array {value}", { value: [{ foo: "bar", fizz: "buzz" }] });
    logger.debug("Log with multiple values {a}, {b}, {c} and more leading text", {
      a: 1,
      b: "foo",
      c: { fizz: "buzz" },
    });
    process.stdout.write("\n");
  });

  it("Can use log levels", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const loggerBuilder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);

    for (const level of LOG_LEVELS) {
      process.stdout.write(`Now using level "${level}"\n`);
      const logger = loggerBuilder.withLevel(level).build();
      doLogs(logger);
      process.stdout.write("\n");
    }

    function doLogs(logger: ILogger) {
      logger.verbose("foo bar fizz buzz");
      logger.debug("foo bar fizz buzz");
      logger.info("foo bar fizz buzz");
      logger.warn("foo bar fizz buzz");
      logger.error("foo bar fizz buzz");
      logger.fatal("foo bar fizz buzz");
    }
  });
});
