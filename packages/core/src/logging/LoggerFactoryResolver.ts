import { globalContainer } from "@/container";
import { LoggerFactory } from "./LoggerFactory";
import { LoggerFactoryToken } from "./LoggerFactoryToken";

export abstract class LoggerFactoryResolver {
  private constructor() {}

  static get(): LoggerFactory {
    return globalContainer.get<LoggerFactory>(LoggerFactoryToken);
  }
}
