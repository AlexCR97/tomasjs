import { HttpServer, HttpServerOptions, IHttpServer } from "@/server";
import { AppBuilder, environmentToken, IApp, IEnvironment } from "@tomasjs/core/app";
import { configurationToken, IConfiguration } from "@tomasjs/core/configuration";
import { IContainerBuilder, IServiceProvider } from "@tomasjs/core/dependency-injection";
import { WebAppPipelineBuilder, WebAppPipelineBuilderDelegate } from "./WebAppPipelineBuilder";

export type WebAppBuilderOptions = {
  server?: IHttpServer;
  serverOptions?: HttpServerOptions;
};

export class WebAppBuilder extends AppBuilder<WebApp> {
  private readonly pipeline = new WebAppPipelineBuilder();
  private options: WebAppBuilderOptions | undefined;

  constructor(options?: WebAppBuilderOptions) {
    super();
    this.options = options;
  }

  setupServerOptions(options: WebAppBuilderOptions): this {
    this.options = options;
    return this;
  }

  setupHttpPipeline(delegate: WebAppPipelineBuilderDelegate): this {
    delegate(this.pipeline);
    return this;
  }

  protected override async buildApp(containerBuilder: IContainerBuilder): Promise<WebApp> {
    const serverOptions = this.options?.serverOptions;
    const server = this.options?.server ?? new HttpServer(serverOptions);

    const { middlewares, interceptors, guards, authenticationPolicies, endpoints } =
      await this.pipeline.build(containerBuilder);

    for (const middleware of middlewares) {
      server.use(middleware);
    }

    for (const interceptor of interceptors) {
      server.useInterceptor(interceptor);
    }

    for (const guard of guards) {
      server.useGuard(guard);
    }

    for (const policy of authenticationPolicies) {
      server.useAuthentication(policy);
    }

    for (const endpoint of endpoints) {
      server.useEndpoint(endpoint);
    }

    const services = await containerBuilder.buildServiceProvider();
    const configuration = services.getOrThrow<IConfiguration>(configurationToken);
    const environment = services.getOrThrow<IEnvironment>(environmentToken);
    return new WebApp(configuration, environment, services, server);
  }
}

export class WebApp implements IApp {
  constructor(
    readonly configuration: IConfiguration,
    readonly environment: IEnvironment,
    readonly services: IServiceProvider,
    readonly server: IHttpServer
  ) {}

  async start(): Promise<void> {
    await this.server.start();
  }

  async stop(): Promise<void> {
    await this.server.stop();
  }
}
