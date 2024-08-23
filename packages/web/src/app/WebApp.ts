import { HttpServer, HttpServerOptions, IHttpServer } from "@/server";
import { AppBuilder, environmentToken, IApp, IEnvironment } from "@tomasjs/core/app";
import { CONFIGURATION, IConfiguration } from "@tomasjs/core/configuration";
import { IContainerBuilder, IServiceProvider } from "@tomasjs/core/dependency-injection";
import { WebAppPipelineBuilder, WebAppPipelineBuilderDelegate } from "./WebAppPipelineBuilder";
import { ILogger, ILoggerBuilder, LOGGER_BUILDER } from "@tomasjs/core/logging";

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

    const {
      middlewares,
      interceptors,
      guards,
      authenticationPolicies,
      authorizationPolicies,
      endpoints,
      errorHandler,
    } = await this.pipeline.build(containerBuilder);

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

    for (const policy of authorizationPolicies) {
      server.useAuthorization(policy);
    }

    for (const endpoint of endpoints) {
      server.useEndpoint(endpoint);
    }

    if (errorHandler !== null) {
      server.useErrorHandler(errorHandler);
    }

    const services = await containerBuilder.buildServiceProvider();
    const configuration = services.getOrThrow<IConfiguration>(CONFIGURATION);
    const environment = services.getOrThrow<IEnvironment>(environmentToken);
    const loggerBuilder = services.getOrThrow<ILoggerBuilder>(LOGGER_BUILDER);
    const logger = loggerBuilder.withCategory("@tomasjs/web/WebApp").build();
    return new WebApp(configuration, environment, services, server, logger);
  }
}

export class WebApp implements IApp {
  constructor(
    readonly configuration: IConfiguration,
    readonly environment: IEnvironment,
    readonly services: IServiceProvider,
    readonly server: IHttpServer,
    readonly logger: ILogger
  ) {}

  async start(): Promise<void> {
    this.logger.info("Starting application...");

    await this.server.start();

    this.logger.info("Application listening at {address}", {
      address: `http://localhost:${this.server.port}`,
    });
  }

  async stop(): Promise<void> {
    this.logger.warn("Stopping application...");

    await this.server.stop();

    this.logger.warn("Application stopped.");
  }
}
