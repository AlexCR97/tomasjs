import "reflect-metadata";
import { Configuration } from "@/configuration";
import {
  ConsoleAppBuilder,
  ConsoleAppEntryPointError,
  EntryPointFunction,
  IEntryPoint,
} from "./ConsoleApp";
import { ServiceProvider, inject } from "@/dependency-injection";
import { Environment } from "@/app";
import { ILoggerBuilder, LOGGER_BUILDER, LoggerConfiguration } from "@/logging";
import { Logger } from "@/logging/Logger";

describe("ConsoleApp", () => {
  it("should build a console app", async () => {
    const app = await new ConsoleAppBuilder().build();
    expect(app.configuration).toBeInstanceOf(Configuration);
    expect(app.environment).toBeInstanceOf(Environment);
    expect(app.services).toBeInstanceOf(ServiceProvider);
  });

  it("should use an entry point instance", async () => {
    let counter = 0;

    class Main implements IEntryPoint {
      main(args: string[]): void | Promise<void> {
        counter++;
      }
    }

    const app = await new ConsoleAppBuilder().addEntryPoint(Main).build();

    await app.start();

    expect(counter).toBe(1);
  });

  it("should use a named entry point function", async () => {
    let counter = 0;

    const main: EntryPointFunction = ({ args, configuration, services }) => {
      expect(Array.isArray(args)).toBe(true);
      expect(configuration).toBeInstanceOf(Configuration);
      expect(services).toBeInstanceOf(ServiceProvider);
      counter++;
    };

    const app = await new ConsoleAppBuilder().addEntryPoint(main).build();

    await app.start();

    expect(counter).toBe(1);
  });

  it("should use an anonymous entry point function", async () => {
    let counter = 0;

    const app = await new ConsoleAppBuilder()
      .addEntryPoint(({ args, configuration, services }) => {
        expect(Array.isArray(args)).toBe(true);
        expect(configuration).toBeInstanceOf(Configuration);
        expect(services).toBeInstanceOf(ServiceProvider);
        counter++;
      })
      .build();

    await app.start();

    expect(counter).toBe(1);
  });

  it("should use an anonymous entry point function without arguments", async () => {
    let counter = 0;

    const app = await new ConsoleAppBuilder()
      .addEntryPoint(() => {
        counter++;
      })
      .build();

    await app.start();

    expect(counter).toBe(1);
  });

  it("should inject dependencies", async () => {
    let result = 0;

    class Sum {
      add(a: number, b: number): number {
        return a + b;
      }
    }

    class Main implements IEntryPoint {
      constructor(@inject(Sum) private readonly sum: Sum) {}

      main(args: string[]): void | Promise<void> {
        result = this.sum.add(34, 35);
      }
    }

    await new ConsoleAppBuilder()
      .addEntryPoint(Main)
      .setupContainer((services) => services.add("singleton", Sum))
      .build()
      .then((app) => app.start());

    expect(result).toBe(69);
  });

  it("should throw if no entry point configured", async () => {
    try {
      await new ConsoleAppBuilder().build().then((app) => app.start());
    } catch (err) {
      expect(err).toBeInstanceOf(ConsoleAppEntryPointError);
    }
  });

  it("should configure logging", async () => {
    const loggerConfig: LoggerConfiguration = {
      default: {
        category: "foo",
        level: "warn",
        showCategory: true,
        showLevel: false,
        showTimestamp: false,
      },
      minimumLevel: {
        default: "error",
        override: {
          ["bar"]: "verbose",
        },
      },
    };

    await new ConsoleAppBuilder()
      .setupLogging((logger) => logger.withConfiguration(loggerConfig))
      .addEntryPoint(({ services }) => {
        const loggerBuilder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
        const logger = loggerBuilder.build();
        const typedLogger = logger as Logger;
        expect(typedLogger.options).toMatchObject(loggerConfig.default!);
      })
      .build()
      .then((app) => app.start());
  });
});
