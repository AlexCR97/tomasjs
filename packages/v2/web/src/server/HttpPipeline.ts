import { ResponseWriter } from "./ResponseWriter";
import { Middleware } from "./Middleware";
import { RequestContext } from "./RequestContext";

export interface IHttpPipeline {
  run(request: RequestContext, response: ResponseWriter): Promise<void>;
}

export class RecursiveHttpPipeline implements IHttpPipeline {
  private readonly middlewares: Middleware[];
  private readonly terminalMiddleware: Middleware;

  constructor(middlewares: Middleware[]) {
    this.middlewares = middlewares;

    this.terminalMiddleware = async (_, response) => {
      if (response.sent) {
        return;
      }

      return await response.send();
    };
  }

  async run(request: RequestContext, response: ResponseWriter): Promise<void> {
    const current = this.middlewares.length === 0 ? this.terminalMiddleware : this.middlewares[0];
    return await this.runPipeline(request, response, current, 1);
  }

  private async runPipeline(
    request: RequestContext,
    response: ResponseWriter,
    current: Middleware,
    nextIndex: number
  ): Promise<void> {
    return await current(request, response, async () => {
      const next = this.middlewares.at(nextIndex) ?? this.terminalMiddleware;
      return await this.runPipeline(request, response, next, nextIndex + 1);
    });
  }
}

export class IterativeHttpPipeline implements IHttpPipeline {
  private readonly middlewares: Middleware[];
  private readonly terminalMiddleware: Middleware;

  constructor(middlewares: Middleware[]) {
    this.middlewares = middlewares;

    this.terminalMiddleware = async (_, response) => {
      if (!response.sent) {
        return await response.send();
      }
    };
  }

  async run(request: RequestContext, response: ResponseWriter): Promise<void> {
    let currentIndex = 0;

    const next = async () => {
      if (currentIndex < this.middlewares.length) {
        const current = this.middlewares[currentIndex++];
        await current(request, response, next);
      } else {
        await this.terminalMiddleware(request, response, async () => {});
      }
    };

    await next();
  }
}

export { IterativeHttpPipeline as HttpPipeline };
