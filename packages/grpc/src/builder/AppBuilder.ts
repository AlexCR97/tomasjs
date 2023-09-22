import {
  Server,
  ServerCredentials,
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import { AppSetupType } from "./AppSetupType";
import { ClassConstructor, Container, ServiceContainer, TomasLogger } from "@tomasjs/core";
import { AppSetupFunction } from "./AppSetupFunction";
import { AppSetupFactory, isAppSetupFactory } from "./AppSetupFactory";
import { UseService } from "./UseService";

interface IAppBuilder {
  use(setup: AppSetupType): IAppBuilder;

  useService<TImplementation extends UntypedServiceImplementation>(
    definition: ServiceDefinition<TImplementation>,
    implementation: ClassConstructor<TImplementation>
  ): IAppBuilder;

  buildAsync(): Promise<Server>;
}

interface AppBuilderOptions {
  server?: Server;
  address?: string;
  credentials?: ServerCredentials;
  container?: Container;
}

export class AppBuilder implements IAppBuilder {
  private readonly server: Server;
  private readonly address: string;
  private readonly defaultAddress = "0.0.0.0:50050";
  private readonly credentials: ServerCredentials;
  private readonly container: Container;
  private readonly setups: AppSetupType[] = [];
  private readonly logger = new TomasLogger(`@tomasjs/grpc/${AppBuilder.name}`, "debug");

  constructor(options?: AppBuilderOptions) {
    this.server = options?.server ?? new Server();
    this.address = options?.address ?? this.defaultAddress;
    this.credentials = options?.credentials ?? ServerCredentials.createInsecure();
    this.container = options?.container ?? new ServiceContainer();
  }

  use(setup: AppSetupType): IAppBuilder {
    this.setups.push(setup);
    return this;
  }

  useService<TImplementation extends UntypedServiceImplementation>(
    definition: ServiceDefinition<TImplementation>,
    implementation: ClassConstructor<TImplementation>
  ): IAppBuilder {
    return this.use(new UseService(definition, implementation));
  }

  async buildAsync(): Promise<Server> {
    await this.bootstrapSetupsAsync();
    return await this.startServerAsync();
  }

  private async bootstrapSetupsAsync(): Promise<void> {
    for (const setup of this.setups) {
      if (isAppSetupFactory(setup)) {
        await this.bootstrapSetupFactoryAsync(setup);
      } else {
        await this.bootstrapSetupFunctionAsync(setup);
      }
    }
  }

  private async bootstrapSetupFunctionAsync(setup: AppSetupFunction): Promise<void> {
    await setup(this.server, this.container);
  }

  private async bootstrapSetupFactoryAsync(setup: AppSetupFactory): Promise<void> {
    const setupFunction = setup.create();
    await this.bootstrapSetupFunctionAsync(setupFunction);
  }

  private async startServerAsync(): Promise<Server> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(this.address.toString(), this.credentials, (err) => {
        if (err !== null) {
          return reject(err);
        }

        this.server.start();
        return resolve(this.server);
      });
    });
  }
}
