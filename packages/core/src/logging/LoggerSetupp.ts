import {
  Configuration,
  ConfigurationSection,
  IConfiguration,
  IConfigurationSection,
  configurationToken,
} from "@/configuration";
import { ContainerSetup, IServiceProvider } from "@/dependency-injection";
import { InvalidOperationError } from "@/errors";
import { LOGGER, LOGGER_BUILDER } from "./tokens";
import { ILoggerBuilder, LoggerBuilder } from "./LoggerBuilder";
import { ILogger, LoggerOptions } from "./Logger";
import { LogLevel } from "./LogLevel";

interface ILoggerSetup {
  withConfiguration(config: IConfiguration): this;
  withConfiguration(config: IConfigurationSection): this;
  withConfiguration(config: LoggerConfiguration): this;
}

export type LoggerConfiguration = Partial<{
  default: Partial<LoggerOptions>;
  minimumLevel: Partial<{
    default: LogLevel;
    override: {
      [key: string]: LogLevel;
    };
  }>;
}>;

export class LoggerSetup implements ILoggerSetup {
  private config: LoggerConfiguration | undefined;

  withConfiguration(config: IConfiguration): this;
  withConfiguration(config: IConfigurationSection): this;
  withConfiguration(config: LoggerConfiguration): this;
  withConfiguration(...args: any[]): this {
    const [config] = args;

    if (config instanceof Configuration) {
      const loggerConfig = this.toLoggerConfiguration(config.sectionOrThrow("logging"));
      return this.withLoggerConfiguration(loggerConfig);
    }

    if (config instanceof ConfigurationSection) {
      const loggerConfig = this.toLoggerConfiguration(config);
      return this.withLoggerConfiguration(loggerConfig);
    }

    if (typeof config === "object") {
      return this.withLoggerConfiguration(config);
    }

    throw new InvalidOperationError();
  }

  private toLoggerConfiguration(config: IConfigurationSection): LoggerConfiguration {
    return config.valueOrThrow<LoggerConfiguration>("object");
  }

  private withLoggerConfiguration(config: LoggerConfiguration): this {
    this.config = config;
    return this;
  }

  build(): ContainerSetup {
    return (container) => {
      container.add<ILoggerBuilder>("singleton", LOGGER_BUILDER, (services: IServiceProvider) => {
        const configuration = services.get<IConfiguration>(configurationToken);

        const loggerConfig = this.getLoggerConfiguration(configuration);
        const defaultOptions = loggerConfig?.default;

        const loggerBuilder =
          defaultOptions === undefined || defaultOptions === null
            ? LoggerBuilder.default()
            : LoggerBuilder.fromOptions(defaultOptions);

        if (configuration) {
          loggerBuilder.withConfiguration(configuration);
        }

        return loggerBuilder;
      });

      container.add<ILogger>("singleton", LOGGER, (services: IServiceProvider) => {
        return services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER).build();
      });
    };
  }

  private getLoggerConfiguration(
    configuration: IConfiguration | undefined
  ): LoggerConfiguration | null {
    if (this.config !== undefined && this.config !== null) {
      return this.config;
    }

    const loggerConfig = configuration?.section("logging")?.value<LoggerConfiguration>("object");

    return loggerConfig ?? null;
  }
}
