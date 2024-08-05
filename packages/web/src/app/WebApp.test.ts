import "reflect-metadata";
import { inject } from "@tomasjs/core/dependency-injection";
import { HTTP_STATUS_CODES, HttpClient, IHttpClient } from "@tomasjs/core/http";
import { ILogger, LOGGER } from "@tomasjs/core/logging";
import {
  IMiddleware,
  IMiddlewareFactory,
  MiddlewareFactoryFunction,
  MiddlewareFunction,
  NextFunction,
} from "@/middleware";
import { HttpResponse, IHttpServer, IRequestContext, IResponseWriter } from "@/server";
import { testHttpServer } from "@/test";
import { WebApp, WebAppBuilder } from "./WebApp";

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

  describe("use", () => {
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

  describe("useInterceptor", () => {
    // TODO Do not skip this test when endpoints can be used
    it.skip("should use an InterceptorFunction", async () => {
      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useInterceptor((req) => {
            req.user.authenticate();
          });

          // TODO Use endpoint here
          pipeline.use(async (req, res, next) => {
            const status = req.user.authenticated
              ? HTTP_STATUS_CODES.ok
              : HTTP_STATUS_CODES.unauthorized;

            return await res.withStatus(status).send();
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });
  });

  describe("useEndpoint", () => {
    it("should map an endpoint", async () => {
      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useEndpoint({
            method: "GET",
            path: "/",
            handler: ({ services }) => {
              const logger = services.getOrThrow<ILogger>(LOGGER);
              logger.debug("Endpoints work!");
              return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
            },
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should map an endpoint with the shorthand", async () => {
      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useEndpoint("GET", "/", ({ services }) => {
            const logger = services.getOrThrow<ILogger>(LOGGER);
            logger.debug("Endpoint with shorthand works!");
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should map an endpoint with the GET shorthand", async () => {
      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.get("/", ({ services }) => {
            const logger = services.getOrThrow<ILogger>(LOGGER);
            logger.debug("Endpoint with GET shorthand works!");
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });
  });
});
