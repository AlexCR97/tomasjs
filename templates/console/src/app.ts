import "reflect-metadata";
import { ConsoleAppBuilder } from "@tomasjs/core/console";
import { inject } from "@tomasjs/core/dependency-injection";
import { ILogger, LOGGER } from "@tomasjs/core/logging";

class Greeter {
  constructor(@inject(LOGGER) private readonly logger: ILogger) {}

  greet(name: string) {
    this.logger.info("Hello {name}!", { name });
  }
}

new ConsoleAppBuilder()
  .setupConfiguration((config) => {
    // App configuration goes here
  })
  .setupLogging((logging) => {
    // Logging setup goes here
  })
  .setupBus((bus) => {
    // Bus setup goes here
  })
  .setupContainer((container) => {
    // Custom services go here

    container.add("singleton", Greeter);
  })
  .addEntryPoint(({ services }) => {
    // Your application logic goes here

    const greeter = services.getOrThrow(Greeter);
    greeter.greet("TomasJS");
  })
  .build()
  .then((app) => app.start());
