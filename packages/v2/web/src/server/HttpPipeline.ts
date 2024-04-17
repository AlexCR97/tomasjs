import { IncomingMessage, ServerResponse } from "http";
import { ResponseWriter } from "./ResponseWriter";
import { Middleware } from "./HttpServer";

interface IHttpPipeline {
  run(req: IncomingMessage, res: ServerResponse): Promise<void>;
}

class RecursiveHttpPipeline implements IHttpPipeline {
  private readonly middlewares: Middleware[];
  private readonly terminalMiddleware: Middleware;

  constructor(middlewares: Middleware[]) {
    this.middlewares = middlewares;

    this.terminalMiddleware = (_, res) => {
      return new ResponseWriter(res).send();
    };
  }

  async run(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const current = this.middlewares.length === 0 ? this.terminalMiddleware : this.middlewares[0];
    return await this.runPipeline(req, res, current, 1);
  }

  private async runPipeline(
    req: IncomingMessage,
    res: ServerResponse,
    current: Middleware,
    nextIndex: number
  ): Promise<void> {
    return await current(req, res, async () => {
      const next = this.middlewares.at(nextIndex) ?? this.terminalMiddleware;
      return await this.runPipeline(req, res, next, nextIndex + 1);
    });
  }
}

// TODO Implement non-recursive IHttpPipeline

export { RecursiveHttpPipeline as HttpPipeline };
