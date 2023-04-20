import { globalContainer } from "@tomasjs/core";
import { LoggerFactory } from "./LoggerFactory";
import { LoggerFactoryToken } from "./LoggerFactoryToken";

export class LoggerFactoryResolver {
  getLoggerFactory(): LoggerFactory {
    return globalContainer.get<LoggerFactory>(LoggerFactoryToken);
  }
}
