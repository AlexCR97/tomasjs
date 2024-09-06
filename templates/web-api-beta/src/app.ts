import "reflect-metadata";
import { CONFIGURATION, IConfiguration } from "@tomasjs/core/configuration";
import { inject } from "@tomasjs/core/dependency-injection";
import { ILogger, LOGGER } from "@tomasjs/core/logging";
import { ProblemDetailsErrorHandler, RequestProfiler, WebAppBuilder } from "@tomasjs/web/app";
import { errorExtension } from "@tomasjs/web/server";

class Greeter {
  constructor(@inject(LOGGER) private readonly logger: ILogger) {}

  greet(name: string): string {
    this.logger.info("Hello {name}!", { name });
    return `Hello ${name}!`;
  }
}

new WebAppBuilder()
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
  .setupHttpPipeline((pipeline) => {
    // Your HTTP pipeline goes here

    pipeline.use(RequestProfiler);

    pipeline.useErrorHandler(
      new ProblemDetailsErrorHandler()
        .extend(errorExtension({ stack: true }))
    );

    pipeline.get("/", ({ services, query }) => {
      const config = services.getOrThrow<IConfiguration>(CONFIGURATION);

      const greeter = services.getOrThrow(Greeter);

      const username =
        query.first("username")
        ?? config.section("username")?.value<string>("string")
        ?? "stranger";

      return greeter.greet(username);
    });
  })
  .build()
  .then((app) => app.start());
