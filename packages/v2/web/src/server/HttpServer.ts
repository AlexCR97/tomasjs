import { Server, createServer } from "http";
import {
  Endpoint,
  EndpointHandler,
  EndpointOptions,
  EndpointResponse,
  isEndpoint,
} from "./Endpoint";
import { ResponseWriter } from "./ResponseWriter";
import { HttpMethod } from "@tomasjs/core/http";
import { InvalidOperationError } from "@tomasjs/core/errors";
import {
  HttpPipeline,
  IHttpPipeline,
  IterativeHttpPipeline,
  RecursiveHttpPipeline,
} from "./HttpPipeline";
import { Middleware } from "./Middleware";
import { RequestContext } from "./RequestContext";
import { ErrorHandler } from "./ErrorHandler";
import { statusCodes } from "@/statusCodes";
import { PlainTextContent } from "@/content";
import { Guard } from "./Guard";
import { Interceptor } from "./Interceptor";
import { MiddlewareAggregate } from "./MiddlewareAggregate";
import { AuthenticationPolicy, AuthorizationPolicy } from "@/auth";

interface IHttpServer {
  use(middleware: Middleware): this;
  useInterceptor(interceptor: Interceptor): this;
  useGuard(guard: Guard): this;
  useAuthentication(policy: AuthenticationPolicy): this;
  useAuthorization(policy: AuthorizationPolicy): this;
  useEndpoint(endpoint: Endpoint): this;
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
  readonly port: number;
  private readonly middlewares: Middleware[];
  private readonly interceptors: Interceptor[];
  private readonly guards: Guard[];
  private readonly authenticationPolicies: AuthenticationPolicy[];
  private readonly authorizationPolicies: AuthorizationPolicy[];
  private readonly endpoints: Endpoint[];
  private errorHandler: ErrorHandler | undefined;
  private readonly server: Server;

  private readonly defaultErrorHandler: ErrorHandler = async (req, res, err) => {
    const response = new EndpointResponse({
      status: statusCodes.internalServerError,
      content: PlainTextContent.from("An unexpected error occurred on the server"),
    });

    return await res
      .withContent(response.content)
      .withHeaders(response.headers)
      .withStatus(response.status)
      .send();
  };

  private readonly terminalMiddleware: Middleware = async (_, res) => {
    if (res.sent) {
      return;
    }

    return await res.send();
  };

  constructor(options?: HttpServerOptions) {
    this.port = options?.port ?? 8080; // TODO Fallback to a random number
    this.middlewares = [];
    this.interceptors = [];
    this.guards = [];
    this.authenticationPolicies = [];
    this.authorizationPolicies = [];
    this.endpoints = [];
    this.server = createServer(async (req, res) => {
      const middlewares = new MiddlewareAggregate()
        .addErrorHandler(this.errorHandler ?? this.defaultErrorHandler)
        .addMiddleware(...this.middlewares)
        .addInterceptor(...this.interceptors)
        .addGuard(...this.guards)
        .addAuthentication(...this.authenticationPolicies)
        .addAuthorization(...this.authorizationPolicies)
        .addEndpoint(...this.endpoints)
        .addMiddleware(this.terminalMiddleware)
        .get();

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

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  useInterceptor(interceptor: Interceptor): this {
    this.interceptors.push(interceptor);
    return this;
  }

  useGuard(guard: Guard): this {
    this.guards.push(guard);
    return this;
  }

  useAuthentication(policy: AuthenticationPolicy): this {
    this.authenticationPolicies.push(policy);
    return this;
  }

  useAuthorization(policy: AuthorizationPolicy): this {
    this.authorizationPolicies.push(policy);
    return this;
  }

  useEndpoint(endpoint: Endpoint): this;
  useEndpoint(
    method: HttpMethod,
    path: string,
    handler: EndpointHandler,
    options?: EndpointOptions
  ): this;
  useEndpoint(...args: any[]): this {
    if (args.length === 1) {
      if (isEndpoint(args[0])) {
        return this.mapEndpoint(args[0]);
      }
    }

    if (args.length === 3 || args.length === 4) {
      const [method, path, handler, options] = args;
      return this.mapEndpoint({ method, path, handler, options });
    }

    throw new InvalidOperationError();
  }

  private mapEndpoint(endpoint: Endpoint): this {
    this.endpoints.push(endpoint);
    return this;
  }

  useErrorHandler(handler: ErrorHandler): this {
    this.errorHandler = handler;
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
