import { ContainerSetup } from "@/dependency-injection/ContainerSetup";
import { LoggerFactory } from "./LoggerFactory";
import { IServiceProvider } from "@/dependency-injection/ServiceProvider";
import { GLOBAL_LOGGER } from "./tokens";

export const loggerSetup: ContainerSetup = (container) => {
  container.add("singleton", LoggerFactory);
  container.add("singleton", GLOBAL_LOGGER, (services: IServiceProvider) => {
    const loggerFactory = services.getOrThrow(LoggerFactory);
    return loggerFactory.createLogger("Global", "debug");
  });
};
