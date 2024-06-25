import { ContainerSetup } from "@/dependency-injection";
import { IServiceProvider } from "@/dependency-injection";
import { LOGGER, LOGGER_BUILDER } from "./tokens";
import { ILoggerBuilder, LoggerBuilder } from "./LoggerBuilder";
import {
  Configuration,
  ConfigurationSection,
  IConfiguration,
  IConfigurationSection,
  configurationToken,
} from "@/configuration";
import { ILogger, LogLevel, LoggerOptions } from "./Logger";
import { InvalidOperationError } from "@/errors";

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
        const loggerConfig = this.getLoggerConfiguration(services);
        const defaultOptions = loggerConfig?.default;

        return defaultOptions === undefined || defaultOptions === null
          ? LoggerBuilder.default()
          : LoggerBuilder.fromOptions(defaultOptions);
      });

      container.add<ILogger>("singleton", LOGGER, (services: IServiceProvider) => {
        return services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER).build();
      });
    };
  }

  private getLoggerConfiguration(services: IServiceProvider): LoggerConfiguration | null {
    if (this.config !== undefined && this.config !== null) {
      return this.config;
    }

    return (
      services
        .get<IConfiguration>(configurationToken)
        ?.section("logging")
        ?.value<LoggerConfiguration>("object") ?? null
    );
  }
}
