import { Server, createServer } from "http";
import { Endpoint, EndpointHandler, isEndpoint } from "./Endpoint";
import { ResponseWriter } from "./ResponseWriter";
import { HttpMethod } from "@tomasjs/core/http";
import { InvalidOperationError } from "@tomasjs/core/errors";
import { HttpPipeline } from "./HttpPipeline";
import { Middleware } from "./Middleware";
import { RequestContext } from "./RequestContext";
import { endpointsMiddleware } from "./EndpointMiddleware";

interface IHttpServer {
  use(middleware: Middleware): this;
  map(endpoint: Endpoint): this;
  map(method: HttpMethod, path: string, handler: EndpointHandler): this;
  start(): Promise<this>;
  stop(): Promise<void>;
}

export class HttpServer implements IHttpServer {
  private readonly port: number;
  private readonly middlewares: Middleware[];
  private readonly endpoints: Endpoint[];
  private readonly server: Server;

  constructor(options?: { port?: number }) {
    this.port = options?.port ?? 8080; // TODO Fallback to a random number
    this.middlewares = [];
    this.endpoints = [];
    this.server = createServer(async (req, res) => {
      const middlewares = [...this.middlewares, endpointsMiddleware(this.endpoints)];
      const request = await RequestContext.from(req);
      const response = new ResponseWriter(res);
      return await new HttpPipeline(middlewares).run(request, response);
    });
  }

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  map(endpoint: Endpoint): this;
  map(method: HttpMethod, path: string, handler: EndpointHandler): this;
  map(...args: any[]): this {
    if (args.length === 1) {
      if (isEndpoint(args[0])) {
        return this.mapEndpoint(args[0]);
      }
    }

    if (args.length === 3) {
      const [method, path, handler] = args;
      return this.mapEndpoint({ method, path, handler });
    }

    throw new InvalidOperationError();
  }

  private mapEndpoint(endpoint: Endpoint): this {
    this.endpoints.push(endpoint);
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
