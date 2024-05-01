import { ConfigurationSetup, IConfiguration, configurationToken } from "@/configuration";
import { BusSetup } from "@/cqrs";
import { ContainerBuilder, IServiceProvider } from "@/dependency-injection";
import { Environment, IEnvironment, environmentToken } from "./Environment";

interface IAppBuilder<TApp extends IApp> {
  setupConfiguration(delegate: ConfigurationSetupDelegate): this;
  setupLogging(): this;
  setupBus(delegate: BusSetupDelegate): this;
  setupServices(delegate: ContainerBuilderDelegate): this;
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
type ContainerBuilderDelegate = (container: ContainerBuilder) => void;

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
    return this;
  }

  setupBus(delegate: BusSetupDelegate): this {
    this.busSetupDelegates.push(delegate);
    return this;
  }

  setupServices(delegate: ContainerBuilderDelegate): this {
    this.containerBuilderDelegates.push(delegate);
    return this;
  }

  async build(): Promise<TApp> {
    const container = new ContainerBuilder()
      .addConfiguration((config) => {
        for (const delegate of this.configurationSetupDelegates) {
          delegate(config);
        }
      })
      .addLogging()
      .addBus((bus) => {
        for (const delegate of this.busSetupDelegates) {
          delegate(bus);
        }
      });

    for (const delegate of this.containerBuilderDelegates) {
      delegate(container);
    }

    const services = await container.buildServiceProvider();
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
