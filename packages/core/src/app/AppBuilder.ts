import { ConfigurationSetup, IConfiguration, configurationToken } from "@/configuration";
import { BusSetup } from "@/cqrs";
import {
  ContainerBuilder,
  ContainerBuilderDelegate,
  IServiceProvider,
} from "@/dependency-injection";
import { Environment, IEnvironment, environmentToken } from "./Environment";
import { LoggerSetup } from "@/logging";

interface IAppBuilder<TApp extends IApp> {
  setupConfiguration(delegate: ConfigurationSetupDelegate): this;
  setupLogging(): this;
  setupBus(delegate: BusSetupDelegate): this;
  setupContainer(delegate: ContainerBuilderDelegate): this;
  build(): Promise<TApp>;
}

export interface IApp {
  readonly configuration: IConfiguration;
  readonly environment: IEnvironment;
  readonly services: IServiceProvider;
  start(): Promise<void>;
  stop(): Promise<void>;
}

type ConfigurationSetupDelegate = (builder: ConfigurationSetup) => void;
type BusSetupDelegate = (builder: BusSetup) => void;

export abstract class AppBuilder<TApp extends IApp> implements IAppBuilder<TApp> {
  private configurationSetupDelegates: ConfigurationSetupDelegate[] = [];
  private busSetupDelegates: BusSetupDelegate[] = [];
  private containerBuilderDelegates: ContainerBuilderDelegate[] = [];

  constructor() {
    const env = Environment.current();
    this.configurationSetupDelegates.push((config) => config.addRawSource(env));
    this.containerBuilderDelegates.push((container) =>
      container.add("singleton", environmentToken, env)
    );
  }

  setupConfiguration(delegate: ConfigurationSetupDelegate): this {
    this.configurationSetupDelegates.push(delegate);
    return this;
  }

  setupLogging(): this {
    // TODO Implement this
    return this;
  }

  setupBus(delegate: BusSetupDelegate): this {
    this.busSetupDelegates.push(delegate);
    return this;
  }

  setupContainer(delegate: ContainerBuilderDelegate): this {
    this.containerBuilderDelegates.push(delegate);
    return this;
  }

  async build(): Promise<TApp> {
    const containerBuilder = new ContainerBuilder()
      .delegate((builder) => {
        const setup = new ConfigurationSetup();

        for (const delegate of this.configurationSetupDelegates) {
          delegate(setup);
        }

        builder.setup(setup.build());
      })
      .delegate((builder) => {
        // TODO Add delegator
        builder.setup(new LoggerSetup().build());
      })
      .delegate((builder) => {
        const busSetup = new BusSetup();

        for (const delegate of this.busSetupDelegates) {
          delegate(busSetup);
        }

        builder.setup(busSetup.build());
      })
      .delegate((builder) => {
        for (const delegate of this.containerBuilderDelegates) {
          delegate(builder);
        }
      });

    const services = await containerBuilder.buildServiceProvider();
    const configuration = services.getOrThrow<IConfiguration>(configurationToken);
    const environment = services.getOrThrow<IEnvironment>(environmentToken);
    return await this.buildApp(configuration, environment, services);
  }

  protected abstract buildApp(
    configuration: IConfiguration,
    environment: IEnvironment,
    services: IServiceProvider
  ): Promise<TApp>;
}
