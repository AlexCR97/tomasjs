import { ContainerSetup, ContainerSetupFactory } from "@/builder";
import { ClassConstructor } from "@/container";
import { LoggerFactory } from "./LoggerFactory";
import { LoggerFactoryToken } from "./LoggerFactoryToken";

export class LoggerFactorySetup<
  TLoggerFactory extends LoggerFactory
> extends ContainerSetupFactory {
  constructor(private readonly loggerFactoryClass: ClassConstructor<TLoggerFactory>) {
    super();
  }
  create(): ContainerSetup {
    return (container) => {
      container.addClass(this.loggerFactoryClass, {
        scope: "singleton",
        token: LoggerFactoryToken,
      });
    };
  }
}
