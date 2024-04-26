import { Middleware } from "@/middleware";
import { IRequestContext } from "./RequestContext";
import { IResponseWriter } from "./ResponseWriter";

export interface IHttpPipeline {
  run(request: IRequestContext, response: IResponseWriter): Promise<void>;
}

export class RecursiveHttpPipeline implements IHttpPipeline {
  private readonly middlewares: Middleware[];
  private readonly terminalMiddleware: Middleware;

  constructor(middlewares: Middleware[]) {
    this.middlewares = middlewares;

    this.terminalMiddleware = async () => {
      // pipeline ends here
    };
  }

  async run(request: IRequestContext, response: IResponseWriter): Promise<void> {
    const current = this.middlewares.length === 0 ? this.terminalMiddleware : this.middlewares[0];
    return await this.runPipeline(request, response, current, 1);
  }

  private async runPipeline(
    request: IRequestContext,
    response: IResponseWriter,
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

    this.terminalMiddleware = async () => {
      // pipeline ends here
    };
  }

  async run(request: IRequestContext, response: IResponseWriter): Promise<void> {
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
