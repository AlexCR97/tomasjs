import { MiddlewareFunction } from "./Middleware";
import { IRequestContext } from "./RequestContext";
import { IResponseWriter } from "./ResponseWriter";

export interface IHttpPipeline {
  run(request: IRequestContext, response: IResponseWriter): Promise<void>;
}

export class RecursiveHttpPipeline implements IHttpPipeline {
  private readonly middlewares: MiddlewareFunction[];
  private readonly terminalMiddleware: MiddlewareFunction;

  constructor(middlewares: MiddlewareFunction[]) {
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
    req: IRequestContext,
    res: IResponseWriter,
    current: MiddlewareFunction,
    nextIndex: number
  ): Promise<void> {
    return await current({
      req,
      res,
      next: async () => {
        const next = this.middlewares.at(nextIndex) ?? this.terminalMiddleware;
        return await this.runPipeline(req, res, next, nextIndex + 1);
      },
    });
  }
}

export class IterativeHttpPipeline implements IHttpPipeline {
  private readonly middlewares: MiddlewareFunction[];
  private readonly terminalMiddleware: MiddlewareFunction;

  constructor(middlewares: MiddlewareFunction[]) {
    this.middlewares = middlewares;

    this.terminalMiddleware = async () => {
      // pipeline ends here
    };
  }

  async run(req: IRequestContext, res: IResponseWriter): Promise<void> {
    let currentIndex = 0;

    const next = async () => {
      if (currentIndex < this.middlewares.length) {
        const current = this.middlewares[currentIndex++];
        await current({ req, res, next });
      } else {
        await this.terminalMiddleware({ req, res, next: async () => {} });
      }
    };

    await next();
  }
}

export { IterativeHttpPipeline as HttpPipeline };
