import "reflect-metadata";
import { ContainerBuilder } from "@/dependency-injection";
import { LOGGER, LOGGER_BUILDER } from "./tokens";
import { ConfigurationSetup } from "@/configuration";
import { ILogger, Logger, LoggerOptions } from "./Logger";
import { ILoggerBuilder, LoggerBuilder } from "./LoggerBuilder";
import { LoggerSetup } from "./LoggerSetupp";

describe("loggerSetup", () => {
  it("can resolve the default LoggerBuilder", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const builder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
    expect(builder).toBeInstanceOf(LoggerBuilder);

    const logger = builder.build() as Logger;
    expect(logger.options).toMatchObject(LoggerBuilder.defaultOptions);
  });

  it("can resolve the default Logger", async () => {
    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().build())
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const logger = services.getOrThrow<ILogger>(LOGGER);
    expect(logger).toBeInstanceOf(Logger);

    const typedLogger = logger as Logger;
    expect(typedLogger.options).toMatchObject(LoggerBuilder.defaultOptions);
  });

  it("can override the default LoggerBuilder options", async () => {
    const customOptions: Partial<LoggerOptions> = {
      category: "custom",
      level: "error",
      showTimestamp: false,
    };

    const services = await new ContainerBuilder()
      .setup(
        new ConfigurationSetup()
          .addRawSource({
            logging: {
              default: customOptions,
            },
          })
          .build()
      )
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const builder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
    expect(builder).toBeInstanceOf(LoggerBuilder);

    const logger = builder.build() as Logger;
    expect(logger.options).toMatchObject(customOptions);
  });
});
