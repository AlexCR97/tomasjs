import { IncomingMessage, Server, createServer } from "http";
import { Endpoint, EndpointContext, EndpointHandler, isEndpoint } from "./Endpoint";
import { ResponseWriter } from "./ResponseWriter";
import { EndpointResponse, statusCodes } from "@/response";
import { HttpMethod } from "@tomasjs/core/http";
import { InvalidOperationError } from "@tomasjs/core/errors";
import { QueryParams } from "./QueryParams";
import { parse } from "url";

interface IHttpServer {
  map(endpoint: Endpoint): this;
  map(method: HttpMethod, path: string, handler: EndpointHandler): this;
  start(): Promise<this>;
  stop(): Promise<void>;
}

export class HttpServer implements IHttpServer {
  private readonly port: number;
  private readonly endpoints: Endpoint[];
  private readonly server: Server;

  constructor(options?: { port: number }) {
    this.port = options?.port ?? 8080; // TODO Fallback to a random number
    this.endpoints = [];

    this.server = createServer(async (req, res) => {
      const response = await this.handleRequest(req);
      await new ResponseWriter(res)
        .withStatus(response.status)
        .withContent(response.content)
        .send();
    });
  }

  private async handleRequest(req: IncomingMessage): Promise<EndpointResponse> {
    const url = parse(req.url ?? "/", false);
    const path = url.pathname ?? "/";

    const endpoint = this.endpoints.find(
      (x) => x.method.toUpperCase() === req.method && x.path === path
    );

    if (endpoint) {
      const context = this.buildEndpointContext(req);
      return await endpoint.handler(context);
    } else {
      return new EndpointResponse({
        status: statusCodes.notFound,
      });
    }
  }

  private buildEndpointContext(req: IncomingMessage): EndpointContext {
    // TODO Implement builder pattern for EndpointContext

    let query = QueryParams.empty();

    if (req.url !== undefined) {
      const url = parse(req.url, true);
      query = QueryParams.from(url.query);
    }

    return {
      query,
    };
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
