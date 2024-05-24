import { IServiceProvider } from "@/dependency-injection";
import { AppBuilder, IApp } from "./AppBuilder";
import { InvalidOperationError, TomasError } from "@/errors";
import { IConfiguration } from "@/configuration";
import { Constructor } from "@/system";
import { IEnvironment } from "./Environment";

const entryPointToken = "@tomasjs/core/EntryPoint";

export class ConsoleAppBuilder extends AppBuilder<ConsoleApp> {
  addEntryPoint(entryPoint: EntryPoint): this {
    this.setupServices((services) => services.add("scoped", entryPointToken, entryPoint));
    return this;
  }

  protected override async buildApp(
    configuration: IConfiguration,
    environment: IEnvironment,
    services: IServiceProvider
  ): Promise<ConsoleApp> {
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
    const entryPoint = this.services.get(entryPointToken);

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

  return typeof obj === "function" && (obj as Function).length === 1;
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
