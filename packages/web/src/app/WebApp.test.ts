import "reflect-metadata";
import { IHttpServer, IRequestContext, IResponseWriter } from "@/server";
import { WebApp, WebAppBuilder } from "./WebApp";
import { HTTP_STATUS_CODES, HttpClient, IHttpClient } from "@tomasjs/core/http";
import { testHttpServer } from "@/test";
import {
  IMiddleware,
  IMiddlewareFactory,
  MiddlewareFactoryFunction,
  MiddlewareFunction,
  NextFunction,
} from "@/middleware";
import { inject } from "@tomasjs/core/dependency-injection";
import { ILogger, LOGGER } from "@tomasjs/core/logging";

// TODO Rename test suite
describe("x-WebApp", () => {
  let client: IHttpClient;
  let server: IHttpServer;
  let app: WebApp | undefined;

  beforeEach(async () => {
    server = await testHttpServer();
    client = new HttpClient({ baseUrl: `http://localhost:${server.port}` });
  });

  afterEach(async () => {
    if (app) {
      await app.stop();
    }
  });

  it("should use a MiddlewareFunction", async () => {
    app = await new WebAppBuilder({ server })
      .setupHttpPipeline((pipeline) => {
        pipeline.use(async (req, res, next) => {
          return await res.withStatus(HTTP_STATUS_CODES.ok).send();
        });
      })
      .build();

    await app.start();

    const response = await client.get("/");

    expect(response.isSuccess).toBe(true);
  });

  it("should use an IMiddleware", async () => {
    class MyMiddleware implements IMiddleware {
      async run(req: IRequestContext, res: IResponseWriter, next: NextFunction): Promise<void> {
        return await res.withStatus(HTTP_STATUS_CODES.ok).send();
      }
    }

    app = await new WebAppBuilder({ server })
      .setupHttpPipeline((pipeline) => {
        pipeline.use(new MyMiddleware());
      })
      .build();

    await app.start();

    const response = await client.get("/");

    expect(response.isSuccess).toBe(true);
  });

  it("should use an IMiddleware service", async () => {
    class MyMiddleware implements IMiddleware {
      constructor(@inject(LOGGER) private readonly logger: ILogger) {}

      async run(req: IRequestContext, res: IResponseWriter, next: NextFunction): Promise<void> {
        this.logger.debug("It works!");
        return await res.withStatus(HTTP_STATUS_CODES.ok).send();
      }
    }

    app = await new WebAppBuilder({ server })
      .setupHttpPipeline((pipeline) => {
        pipeline.use(MyMiddleware);
      })
      .build();

    await app.start();

    const response = await client.get("/");

    expect(response.isSuccess).toBe(true);
  });

  it("should use a MiddlewareFactoryFunction", async () => {
    const middleware: MiddlewareFactoryFunction = () => {
      return async (req, res, next) => {
        return await res.withStatus(HTTP_STATUS_CODES.ok).send();
      };
    };

    app = await new WebAppBuilder({ server })
      .setupHttpPipeline((pipeline) => {
        pipeline.use(middleware);
      })
      .build();

    await app.start();

    const response = await client.get("/");

    expect(response.isSuccess).toBe(true);
  });

  it("should use an IMiddlewareFactory", async () => {
    class MyMiddlewareFactory implements IMiddlewareFactory {
      createMiddleware(): MiddlewareFunction | IMiddleware {
        return async (req, res, next) => {
          return await res.withStatus(HTTP_STATUS_CODES.ok).send();
        };
      }
    }

    app = await new WebAppBuilder({ server })
      .setupHttpPipeline((pipeline) => {
        pipeline.use(new MyMiddlewareFactory());
      })
      .build();

    await app.start();

    const response = await client.get("/");

    expect(response.isSuccess).toBe(true);
  });

  it("should use an IMiddlewareFactory service", async () => {
    class MyMiddlewareFactory implements IMiddlewareFactory {
      constructor(@inject(LOGGER) private readonly logger: ILogger) {}

      createMiddleware(): MiddlewareFunction | IMiddleware {
        return async (req, res, next) => {
          this.logger.debug("It works!");
          return await res.withStatus(HTTP_STATUS_CODES.ok).send();
        };
      }
    }

    app = await new WebAppBuilder({ server })
      .setupHttpPipeline((pipeline) => {
        pipeline.use(MyMiddlewareFactory);
      })
      .build();

    await app.start();

    const response = await client.get("/");

    expect(response.isSuccess).toBe(true);
  });
});
