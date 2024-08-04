import { Server, createServer } from "http";
import { Endpoint, EndpointHandler, EndpointOptions, PlainEndpoint } from "@/endpoint";
import { ResponseWriter } from "./ResponseWriter";
import { HttpMethod } from "@tomasjs/core/http";
import { InvalidOperationError } from "@tomasjs/core/errors";
import {
  HttpPipeline,
  IHttpPipeline,
  IterativeHttpPipeline,
  RecursiveHttpPipeline,
} from "./HttpPipeline";
import { MiddlewareFunction } from "@/middleware";
import { RequestContext } from "./RequestContext";
import { ErrorHandler } from "@/error-handler";
import { Guard } from "@/guard";
import { InterceptorFunction } from "@/interceptor";
import { AuthenticationPolicy, AuthorizationPolicy } from "@/auth";
import { HttpPipelineBuilder } from "./HttpPipelineBuilder";

export interface IHttpServer {
  readonly port: number;

  use(middleware: MiddlewareFunction): this;
  useInterceptor(interceptor: InterceptorFunction): this;
  useGuard(guard: Guard): this;
  useAuthentication(policy: AuthenticationPolicy): this;
  useAuthorization(policy: AuthorizationPolicy): this;
  useEndpoint(endpoint: Endpoint): this;
  useEndpoint(endpoint: PlainEndpoint): this;
  useEndpoint(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler,
    options?: EndpointOptions
  ): this;
  useErrorHandler(handler: ErrorHandler): this;
  start(): Promise<this>;
  stop(): Promise<void>;
}

export type HttpServerOptions = {
  port?: number;
  pipelineMode?: "recursive" | "iterative";
};

export class HttpServer implements IHttpServer {
  private static readonly defaultPort = 3000;

  readonly port: number;

  private readonly pipeline = new HttpPipelineBuilder();
  private readonly server: Server;

  constructor(options?: HttpServerOptions) {
    this.port = options?.port ?? HttpServer.defaultPort;

    this.server = createServer(async (req, res) => {
      const middlewares = this.pipeline.build();

      const httpPipeline: IHttpPipeline =
        options?.pipelineMode === "recursive"
          ? new RecursiveHttpPipeline(middlewares)
          : options?.pipelineMode === "iterative"
          ? new IterativeHttpPipeline(middlewares)
          : new HttpPipeline(middlewares);

      const request = await RequestContext.from(req);
      const response = new ResponseWriter(res);

      return await httpPipeline.run(request, response);
    });
  }

  use(middleware: MiddlewareFunction): this {
    this.pipeline.use(middleware);
    return this;
  }

  useInterceptor(interceptor: InterceptorFunction): this {
    this.pipeline.useInterceptor(interceptor);
    return this;
  }

  useGuard(guard: Guard): this {
    this.pipeline.useGuard(guard);
    return this;
  }

  useAuthentication(policy: AuthenticationPolicy): this {
    this.pipeline.useAuthentication(policy);
    return this;
  }

  useAuthorization(policy: AuthorizationPolicy): this {
    this.pipeline.useAuthorization(policy);
    return this;
  }

  useEndpoint(endpoint: Endpoint): this;
  useEndpoint(endpoint: PlainEndpoint): this;
  useEndpoint(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler,
    options?: EndpointOptions
  ): this;
  useEndpoint(...args: any[]): this {
    if (args.length === 1) {
      const endpoint = args[0];

      if (endpoint instanceof Endpoint) {
        return this.addEndpoint(endpoint.toPlain());
      } else {
        return this.addEndpoint(endpoint);
      }
    }

    if (args.length === 3 || args.length === 4) {
      const [method, path, handler, options] = args;
      return this.addEndpoint({ method, path, handler, options });
    }

    throw new InvalidOperationError();
  }

  private addEndpoint(endpoint: PlainEndpoint): this {
    this.pipeline.useEndpoint(endpoint);
    return this;
  }

  useErrorHandler(handler: ErrorHandler): this {
    this.pipeline.useErrorHandler(handler);
    return this;
  }

  start(): Promise<this> {
    return new Promise((resolve) => {
      this.server.on("listening", () => resolve(this));
      this.server.listen(this.port);
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.closeAllConnections();
      this.server.close((err) => {
        return err === undefined ? resolve() : reject(err);
      });
    });
  }
}
