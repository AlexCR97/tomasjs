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
import { LOG_LEVELS } from "./LogLevel";
import { Log } from "./Log";

describe("logging/LoggerSetup", () => {
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
        format: `{${Log.DEFAULT_DATA_KEYS.category}} {${Log.DEFAULT_DATA_KEYS.message}}`,
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
        format: `{${Log.DEFAULT_DATA_KEYS.timestamp}} {${Log.DEFAULT_DATA_KEYS.level}} {${Log.DEFAULT_DATA_KEYS.message}}`,
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
      format: `{${Log.DEFAULT_DATA_KEYS.message}}`,
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
        format: `[{${Log.DEFAULT_DATA_KEYS.category}}] {${Log.DEFAULT_DATA_KEYS.level}} {${Log.DEFAULT_DATA_KEYS.message}}`,
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

  it("can override the default LogLevel", async () => {
    for (const level of LOG_LEVELS) {
      const loggerConfig: LoggerConfiguration = {
        minimumLevel: {
          default: level,
        },
      };

      const services = await new ContainerBuilder()
        .setup(new ConfigurationSetup().addRawSource({ logging: loggerConfig }).build())
        .setup(new LoggerSetup().build())
        .buildServiceProvider();

      const builder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
      const logger = builder.build();

      process.stdout.write(`Now using level "${level}"\n`);
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

  it("can override a category LogLevel", async () => {
    const category = "TestLogger";

    for (const level of LOG_LEVELS) {
      const loggerConfig: LoggerConfiguration = {
        minimumLevel: {
          override: {
            [category]: level,
          },
        },
      };

      const services = await new ContainerBuilder()
        .setup(new ConfigurationSetup().addRawSource({ logging: loggerConfig }).build())
        .setup(new LoggerSetup().build())
        .buildServiceProvider();

      const builder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
      const defaultLogger = builder.build();
      const overrideLogger = builder.withCategory(category).build();

      process.stdout.write(`Now using level "${level}"\n`);

      process.stdout.write("[default]\n");
      doLogs(defaultLogger);

      process.stdout.write("[override]\n");
      doLogs(overrideLogger);

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

  it("can override the format", async () => {
    const formats = [
      `{${Log.DEFAULT_DATA_KEYS.timestamp}} {${Log.DEFAULT_DATA_KEYS.level}} [{${Log.DEFAULT_DATA_KEYS.category}}] {${Log.DEFAULT_DATA_KEYS.message}}`,
      `{${Log.DEFAULT_DATA_KEYS.level}} [{${Log.DEFAULT_DATA_KEYS.category}}] {${Log.DEFAULT_DATA_KEYS.message}}`,
      `[{${Log.DEFAULT_DATA_KEYS.category}}] {${Log.DEFAULT_DATA_KEYS.message}}`,
      `{${Log.DEFAULT_DATA_KEYS.timestamp}} {${Log.DEFAULT_DATA_KEYS.message}}`,
      `{${Log.DEFAULT_DATA_KEYS.message}}`,
    ] as const;

    for (const format of formats) {
      const loggerConfig: LoggerConfiguration = {
        default: {
          format,
        },
      };

      const services = await new ContainerBuilder()
        .setup(new ConfigurationSetup().addRawSource({ logging: loggerConfig }).build())
        .setup(new LoggerSetup().build())
        .buildServiceProvider();

      const builder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
      const logger = builder.build();

      process.stdout.write(`Now using format "${format}"\n`);
      logger.debug("(a + b) * (a + b) = {result}", { result: "a^2 + b^2 + 2ab" });
      process.stdout.write("\n");
    }
  });
});
