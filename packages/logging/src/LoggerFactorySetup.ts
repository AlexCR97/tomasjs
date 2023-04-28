import { ClassConstructor, ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { LoggerFactory } from "./LoggerFactory";
import { loggerFactoryToken } from "./loggerFactoryToken";

export class LoggerFactorySetup<TLoggerFactory extends LoggerFactory>
  implements ContainerSetupFactory
{
  constructor(private readonly loggerFactoryClass: ClassConstructor<TLoggerFactory>) {}

  create(): ContainerSetupFunction {
    return (container) => {
      container.addClass(this.loggerFactoryClass, {
        scope: "singleton",
        token: loggerFactoryToken,
      });
    };
  }
}
