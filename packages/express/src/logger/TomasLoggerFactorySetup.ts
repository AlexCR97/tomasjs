import { LoggerFactorySetup } from "./LoggerFactorySetup";
import { TomasLoggerFactory } from "./TomasLoggerFactory";

export class TomasLoggerFactorySetup extends LoggerFactorySetup<TomasLoggerFactory> {
  constructor() {
    super(TomasLoggerFactory);
  }
}
