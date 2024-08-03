import {
  HttpPipelineBuilder,
  HttpPipelineBuilderDelegate,
  HttpServer,
  HttpServerOptions,
  IHttpServer,
} from "@/server";
import { AppBuilder, IApp, IEnvironment } from "@tomasjs/core/app";
import { IConfiguration } from "@tomasjs/core/configuration";
import { IServiceProvider } from "@tomasjs/core/dependency-injection";

export type WebAppBuilderOptions = {
  server?: IHttpServer;
  serverOptions?: HttpServerOptions;
};

export class WebAppBuilder extends AppBuilder<WebApp> {
  private readonly pipeline = new HttpPipelineBuilder();
  private options: WebAppBuilderOptions | undefined;

  constructor(options?: WebAppBuilderOptions) {
    super();
    this.options = options;
  }

  setupServerOptions(options: WebAppBuilderOptions): this {
    this.options = options;
    return this;
  }

  setupHttpPipeline(delegate: HttpPipelineBuilderDelegate): this {
    delegate(this.pipeline);
    return this;
  }

  protected override async buildApp(
    configuration: IConfiguration,
    environment: IEnvironment,
    services: IServiceProvider
  ): Promise<WebApp> {
    const serverOptions = this.options?.serverOptions;
    const server = this.options?.server ?? new HttpServer(serverOptions);
    const middlewares = this.pipeline.build();

    for (const middleware of middlewares) {
      server.use(middleware);
    }

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
