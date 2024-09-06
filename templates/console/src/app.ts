import "reflect-metadata";
import { CONFIGURATION, IConfiguration } from "@tomasjs/core/configuration";
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

    config.addJsonSource();
  })
  .setupLogging((logging) => {
    // Logging setup goes here
  })
  .setupMessaging((messaging) => {
    // Messaging setup goes here
  })
  .setupContainer((container) => {
    // Custom services go here

    container.add("singleton", Greeter);
  })
  .addEntryPoint(({ services }) => {
    // Your application logic goes here

    const config = services.getOrThrow<IConfiguration>(CONFIGURATION);
    const greeter = services.getOrThrow(Greeter);

    const username = config.section("username")?.value<string>("string") ?? "stranger";
    greeter.greet(username);
  })
  .build()
  .then((app) => app.start());
