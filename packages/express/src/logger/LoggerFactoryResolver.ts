import { internalContainer } from "@/container";
import { LoggerFactory } from "./LoggerFactory";
import { LoggerFactoryToken } from "./LoggerFactoryToken";

export abstract class LoggerFactoryResolver {
  private constructor() {}

  static get(): LoggerFactory {
    return internalContainer.get<LoggerFactory>(LoggerFactoryToken);
  }
}
