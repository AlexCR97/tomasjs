import { AppBuilder, IEnvironment, IApp, IAppBuilder, ENVIRONMENT } from "@/app";
import { CONFIGURATION, IConfiguration } from "@/configuration";
import { IContainerBuilder, IServiceProvider } from "@/dependency-injection";
import { InvalidOperationError, TomasError } from "@/errors";
import { Constructor, isConstructor } from "@/system";

const ENTRY_POINT = "@tomasjs/core/console/EntryPoint";

export interface IConsoleAppBuilder extends IAppBuilder<ConsoleApp> {
  addEntryPoint(entryPoint: EntryPoint): this;
}

export class ConsoleAppBuilder extends AppBuilder<ConsoleApp> implements IConsoleAppBuilder {
  addEntryPoint(entryPoint: EntryPoint): this {
    this.setupContainer((services) => {
      if (isConstructor(entryPoint)) {
        services.add("scoped", ENTRY_POINT, entryPoint);
      } else if (isEntryPointFunction(entryPoint)) {
        services.addValue("scoped", ENTRY_POINT, entryPoint);
      } else {
        throw new InvalidOperationError();
      }
    });
    return this;
  }

  protected override async buildApp(containerBuilder: IContainerBuilder): Promise<ConsoleApp> {
    const services = await containerBuilder.buildServiceProvider();
    const configuration = services.getOrThrow<IConfiguration>(CONFIGURATION);
    const environment = services.getOrThrow<IEnvironment>(ENVIRONMENT);
    return new ConsoleApp(configuration, environment, services);
  }
}

export class ConsoleApp implements IApp {
  constructor(
    readonly configuration: IConfiguration,
    readonly environment: IEnvironment,
    readonly services: IServiceProvider
  ) {}

  async start(): Promise<void> {
    const entryPoint = this.services.get(ENTRY_POINT);

    if (entryPoint === undefined) {
      throw new ConsoleAppEntryPointError();
    }

    const args = process.argv ?? [];

    if (isEntryPointFunction(entryPoint)) {
      return await entryPoint({ configuration: this.configuration, services: this.services, args });
    }

    if (isEntryPointInstance(entryPoint)) {
      return await entryPoint.main(args);
    }

    throw new InvalidOperationError();
  }

  stop(): Promise<void> {
    return Promise.resolve();
  }
}

export type EntryPoint = EntryPointFunction | Constructor<unknown>;

export type EntryPointFunction = (context: EntryPointFunctionContext) => void | Promise<void>;

export type EntryPointFunctionContext = {
  configuration: IConfiguration;
  services: IServiceProvider;
  args: string[];
};

export interface IEntryPoint {
  main(args: string[]): void | Promise<void>;
}

function isEntryPointFunction(obj: any): obj is EntryPointFunction {
  if (obj === null || obj === undefined) {
    return false;
  }

  return (
    typeof obj === "function" && ((obj as Function).length === 0 || (obj as Function).length === 1)
  );
}

function isEntryPointInstance(obj: any): obj is IEntryPoint {
  if (obj === null || obj === undefined) {
    return false;
  }

  const func = obj[<keyof IEntryPoint>"main"];

  return typeof func === "function";
}

export class ConsoleAppEntryPointError extends TomasError {
  constructor() {
    super(
      "core/ConsoleApp/EntryPointNotFound",
      `No entry point defined. Did you forget to call ${ConsoleAppBuilder.name}.${<
        keyof ConsoleAppBuilder
      >"addEntryPoint"}?`
    );
  }
}
