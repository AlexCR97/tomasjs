import { ConfigurationSetup, IConfiguration } from "@/configuration";
import {
  ContainerBuilder,
  ContainerBuilderDelegate,
  IContainerBuilder,
  IServiceProvider,
} from "@/dependency-injection";
import { LoggerSetup } from "@/logging";
import { Environment, IEnvironment, environmentToken } from "./Environment";
import { IMessagingSetup, MessagingSetup } from "@/messaging";

export interface IAppBuilder<TApp extends IApp> {
  setupConfiguration(delegate: ConfigurationSetupDelegate): this;
  setupLogging(delegate: LoggerSetupDelegate): this;
  setupMessaging(delegate: MessagingSetupDelegate): this;
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

export type ConfigurationSetupDelegate = (builder: ConfigurationSetup) => void;

export type LoggerSetupDelegate = (builder: LoggerSetup) => void;

export type MessagingSetupDelegate = (builder: IMessagingSetup) => void;

export abstract class AppBuilder<TApp extends IApp> implements IAppBuilder<TApp> {
  private readonly configurationSetupDelegates: ConfigurationSetupDelegate[] = [];
  private readonly loggerSetupDelegates: LoggerSetupDelegate[] = [];
  private readonly messagingSetupDelegates: MessagingSetupDelegate[] = [];
  private readonly containerBuilderDelegates: ContainerBuilderDelegate[] = [];

  constructor() {
    const env = Environment.current();

    this.configurationSetupDelegates.push((config) => {
      config.addRawSource(env);
    });

    this.containerBuilderDelegates.push((container) => {
      container.add("singleton", environmentToken, env);
    });
  }

  setupConfiguration(delegate: ConfigurationSetupDelegate): this {
    this.configurationSetupDelegates.push(delegate);
    return this;
  }

  setupLogging(delegate: LoggerSetupDelegate): this {
    this.loggerSetupDelegates.push(delegate);
    return this;
  }

  setupMessaging(delegate: MessagingSetupDelegate): this {
    this.messagingSetupDelegates.push(delegate);
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
        const setup = new LoggerSetup();

        for (const delegate of this.loggerSetupDelegates) {
          delegate(setup);
        }

        builder.setup(setup.build());
      })
      .delegate((builder) => {
        const messagingSetup = new MessagingSetup();

        for (const delegate of this.messagingSetupDelegates) {
          delegate(messagingSetup);
        }

        builder.setup(messagingSetup.build());
      })
      .delegate((builder) => {
        for (const delegate of this.containerBuilderDelegates) {
          delegate(builder);
        }
      });

    return await this.buildApp(containerBuilder);
  }

  protected abstract buildApp(containerBuilder: IContainerBuilder): Promise<TApp>;
}
