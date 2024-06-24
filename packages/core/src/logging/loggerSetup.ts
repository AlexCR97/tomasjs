import { ContainerSetup } from "@/dependency-injection";
import { LoggerFactory } from "./LoggerFactory";
import { IServiceProvider } from "@/dependency-injection";
import { GLOBAL_LOGGER, LOGGER, LOGGER_BUILDER } from "./tokens";
import { ILoggerBuilder, LoggerBuilder } from "./LoggerBuilder";
import { IConfiguration, configurationToken } from "@/configuration";
import { ILogger, LoggerOptions } from "./Logger";

export const loggerSetup: ContainerSetup = (container) => {
  container.add<ILoggerBuilder>("singleton", LOGGER_BUILDER, (services: IServiceProvider) => {
    const config = services.getOrThrow<IConfiguration>(configurationToken);

    const defaultOptions = config
      .section("logging.default")
      ?.value<Partial<LoggerOptions>>("object");

    return defaultOptions === undefined || defaultOptions === null
      ? LoggerBuilder.default()
      : LoggerBuilder.fromOptions(defaultOptions);
  });

  container.add<ILogger>("singleton", LOGGER, (services: IServiceProvider) => {
    return services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER).build();
  });

  container.add("singleton", LoggerFactory);

  container.add("singleton", GLOBAL_LOGGER, (services: IServiceProvider) => {
    const loggerFactory = services.getOrThrow(LoggerFactory);
    return loggerFactory.createLogger("Global", "debug");
  });
};
