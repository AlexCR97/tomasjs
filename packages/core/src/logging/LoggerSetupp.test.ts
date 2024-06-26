import "reflect-metadata";
import { ContainerBuilder } from "@/dependency-injection";
import { LOGGER, LOGGER_BUILDER } from "./tokens";
import {
  Configuration,
  ConfigurationSection,
  ConfigurationSetup,
  RawConfigurationSource,
} from "@/configuration";
import { ILogger, Logger, LoggerOptions } from "./Logger";
import { ILoggerBuilder, LoggerBuilder } from "./LoggerBuilder";
import { LoggerConfiguration, LoggerSetup } from "./LoggerSetupp";

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

  it("can explicitly override the default LoggerConfiguration with a Configuration instance", async () => {
    const loggerConfig: LoggerConfiguration = {
      default: {
        category: "foo",
        level: "verbose",
        showCategory: true,
        showLevel: false,
        showTimestamp: false,
      },
      minimumLevel: {
        default: "error",
        override: {
          bar: "warn",
        },
      },
    };

    const services = await new ContainerBuilder()
      .setup(
        new LoggerSetup()
          .withConfiguration(
            new Configuration([
              ConfigurationSection.fromRoot(
                RawConfigurationSource.new({
                  logging: loggerConfig,
                }).readSource()
              ),
            ])
          )
          .build()
      )
      .buildServiceProvider();

    const builder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
    expect(builder).toBeInstanceOf(LoggerBuilder);

    const logger = builder.build() as Logger;
    expect(logger.options).toMatchObject(loggerConfig.default!);
  });

  it("can explicitly override the default LoggerConfiguration with a ConfigurationSection instance", async () => {
    const loggerConfig: LoggerConfiguration = {
      default: {
        category: "bar",
        level: "info",
        showCategory: false,
        showLevel: true,
        showTimestamp: true,
      },
      minimumLevel: {
        default: "verbose",
        override: {
          foo: "debug",
        },
      },
    };

    const services = await new ContainerBuilder()
      .setup(
        new LoggerSetup()
          .withConfiguration(
            ConfigurationSection.fromRoot(RawConfigurationSource.new(loggerConfig).readSource())
          )
          .build()
      )
      .buildServiceProvider();

    const builder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
    expect(builder).toBeInstanceOf(LoggerBuilder);

    const logger = builder.build() as Logger;
    expect(logger.options).toMatchObject(loggerConfig.default!);
  });

  it("can explicitly override the default LoggerConfiguration with LoggerOptions", async () => {
    const loggerOptions: LoggerOptions = {
      category: "fizz",
      configuration: Configuration.empty(),
      level: "info",
      showCategory: false,
      showLevel: false,
      showTimestamp: false,
    };

    const services = await new ContainerBuilder()
      .setup(new LoggerSetup().withConfiguration({ default: loggerOptions }).build())
      .buildServiceProvider();

    const builder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
    expect(builder).toBeInstanceOf(LoggerBuilder);

    const logger = builder.build() as Logger;
    expect(logger.options).toMatchObject(loggerOptions);
  });

  it("can implicitly override the default LoggerConfiguration with a ConfigurationSetup", async () => {
    const loggerConfig: LoggerConfiguration = {
      default: {
        category: "custom",
        level: "error",
        showTimestamp: false,
      },
    };

    const services = await new ContainerBuilder()
      .setup(new ConfigurationSetup().addRawSource({ logging: loggerConfig }).build())
      .setup(new LoggerSetup().build())
      .buildServiceProvider();

    const builder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
    expect(builder).toBeInstanceOf(LoggerBuilder);

    const logger = builder.build() as Logger;
    expect(logger.options).toMatchObject(loggerConfig.default!);
  });
});
