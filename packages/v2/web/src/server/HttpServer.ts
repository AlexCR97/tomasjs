import { IncomingMessage, Server, ServerResponse, createServer } from "http";
import {
  Endpoint,
  EndpointContext,
  EndpointHandler,
  EndpointResponse,
  isEndpoint,
} from "./Endpoint";
import { ResponseWriter } from "./ResponseWriter";
import { HttpHeader, HttpHeaders, HttpMethod } from "@tomasjs/core/http";
import { InvalidOperationError } from "@tomasjs/core/errors";
import { pipe } from "@tomasjs/core/system";
import { RequestBody } from "./RequestBody";
import { PlainTextContent } from "@/content";
import { UrlParser } from "./UrlParser";
import { statusCodes } from "@/statusCodes";
import { HttpPipeline } from "./HttpPipeline";

interface IHttpServer {
  map(endpoint: Endpoint): this;
  map(method: HttpMethod, path: string, handler: EndpointHandler): this;
  use(middleware: Middleware): this;
  start(): Promise<this>;
  stop(): Promise<void>;
}

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => Promise<void>
) => void | Promise<void>;

export class HttpServer implements IHttpServer {
  private readonly port: number;
  private readonly endpoints: Endpoint[];
  private readonly middlewares: Middleware[];
  private readonly server: Server;

  constructor(options?: { port?: number; middlewares?: boolean }) {
    this.port = options?.port ?? 8080; // TODO Fallback to a random number
    this.middlewares = [];
    this.endpoints = [];

    this.server = createServer(async (req, res) => {
      if (options?.middlewares === true) {
        return await new HttpPipeline(this.middlewares).run(req, res);
      } else {
        const response = await this.handleRequest(req);

        await new ResponseWriter(res)
          .withStatus(response.status)
          .withContent(response.content)
          .send();
      }
    });
  }

  private async handleRequest(req: IncomingMessage): Promise<EndpointResponse> {
    try {
      const urlParser = UrlParser.from(req);

      const endpoint = this.endpoints.find(({ method, path }) => {
        return method.toUpperCase() === req.method && urlParser.matches(path);
      });

      if (endpoint === undefined) {
        return new EndpointResponse({
          status: statusCodes.notFound,
        });
      }

      const context: EndpointContext = {
        method: endpoint.method,
        path: urlParser.path(),
        headers: pipe(req.headers)
          .pipe((headers) =>
            Object.keys(headers)
              .map((key) => <HttpHeader>{ key, value: headers[key] })
              .filter((header) => header.value !== null && header.value !== undefined)
          )
          .pipe((headers) => new HttpHeaders().add(headers).toPlain())
          .get(),
        params: urlParser.routeParams(endpoint.path),
        query: urlParser.queryParams(),
        body: await RequestBody.from(req),
      };

      return await endpoint.handler(context);
    } catch (err) {
      return new EndpointResponse({
        status: statusCodes.internalServerError,
        content: PlainTextContent.from("An unexpected error occurred on the server"),
      });
    }
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

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
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
