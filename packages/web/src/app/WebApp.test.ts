import "reflect-metadata";
import { inject } from "@tomasjs/core/dependency-injection";
import { HTTP_STATUS_CODES, HttpClient, HttpHeaders, IHttpClient } from "@tomasjs/core/http";
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
import {
  IInterceptor,
  IInterceptorFactory,
  InterceptorFactoryFunction,
  InterceptorFunction,
} from "@/interceptor";
import { GuardFactoryFunction, GuardFunction, GuardResult, IGuard, IGuardFactory } from "@/guard";

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
          this.logger.debug("IMiddleware service works!");
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
    it("should use an InterceptorFunction", async () => {
      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useInterceptor((req) => {
            req.user.authenticate();
          });

          pipeline.get("/", ({ user }) => {
            const status = user.authenticated
              ? HTTP_STATUS_CODES.ok
              : HTTP_STATUS_CODES.unauthorized;

            return new HttpResponse({ status });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IInterceptor", async () => {
      class MyInterceptor implements IInterceptor {
        intercept(req: IRequestContext): void {
          req.user.authenticate();
        }
      }

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useInterceptor(new MyInterceptor());

          pipeline.get("/", ({ user }) => {
            const status = user.authenticated
              ? HTTP_STATUS_CODES.ok
              : HTTP_STATUS_CODES.unauthorized;

            return new HttpResponse({ status });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IInterceptor service", async () => {
      class MyInterceptor implements IInterceptor {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}

        intercept(req: IRequestContext): void {
          this.logger.debug("IInterceptor service works!");
          req.user.authenticate();
        }
      }

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useInterceptor(MyInterceptor);

          pipeline.get("/", ({ user }) => {
            const status = user.authenticated
              ? HTTP_STATUS_CODES.ok
              : HTTP_STATUS_CODES.unauthorized;

            return new HttpResponse({ status });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an InterceptorFactoryFunction", async () => {
      const interceptor: InterceptorFactoryFunction = () => {
        return async (req) => {
          req.user.authenticate();
        };
      };

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useInterceptor(interceptor);

          pipeline.get("/", ({ user }) => {
            const status = user.authenticated
              ? HTTP_STATUS_CODES.ok
              : HTTP_STATUS_CODES.unauthorized;

            return new HttpResponse({ status });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.isSuccess).toBe(true);
    });

    it("should use an IInterceptorFactory", async () => {
      class MyInterceptor implements IInterceptorFactory {
        createInterceptor(): InterceptorFunction {
          return async (req) => {
            req.user.authenticate();
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useInterceptor(new MyInterceptor());

          pipeline.get("/", ({ user }) => {
            const status = user.authenticated
              ? HTTP_STATUS_CODES.ok
              : HTTP_STATUS_CODES.unauthorized;

            return new HttpResponse({ status });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.isSuccess).toBe(true);
    });

    it("should use an IInterceptorFactory service", async () => {
      class MyInterceptor implements IInterceptorFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}

        createInterceptor(): InterceptorFunction {
          return async (req) => {
            this.logger.debug("IInterceptorFactory service works!");
            req.user.authenticate();
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useInterceptor(MyInterceptor);

          pipeline.get("/", ({ user }) => {
            const status = user.authenticated
              ? HTTP_STATUS_CODES.ok
              : HTTP_STATUS_CODES.unauthorized;

            return new HttpResponse({ status });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.isSuccess).toBe(true);
    });
  });

  describe("useGuard", () => {
    const secretHeaderKey = "x-foo";
    const secretHeaderValue = "bar";
    const headers = new HttpHeaders().add(secretHeaderKey, secretHeaderValue);

    it("should use a GuardFunction", async () => {
      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useGuard((req) => {
            return req.headers[secretHeaderKey] === secretHeaderValue;
          });

          pipeline.get("/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }));
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IGuard", async () => {
      class MyGuard implements IGuard {
        protect(req: IRequestContext): GuardResult {
          return req.headers[secretHeaderKey] === secretHeaderValue;
        }
      }

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useGuard(new MyGuard());

          pipeline.get("/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }));
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IGuard service", async () => {
      class MyGuard implements IGuard {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}

        protect(req: IRequestContext): GuardResult {
          this.logger.debug("IGuard service works!");
          return req.headers[secretHeaderKey] === secretHeaderValue;
        }
      }

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useGuard(MyGuard);

          pipeline.get("/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }));
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use a GuardFactoryFunction", async () => {
      const myGuard: GuardFactoryFunction = () => {
        return (req: IRequestContext) => {
          return req.headers[secretHeaderKey] === secretHeaderValue;
        };
      };

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useGuard(myGuard);

          pipeline.get("/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }));
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IGuardFactory", async () => {
      class MyGuard implements IGuardFactory {
        createGuard(): GuardFunction | IGuard {
          return (req) => {
            return req.headers[secretHeaderKey] === secretHeaderValue;
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useGuard(new MyGuard());

          pipeline.get("/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }));
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IGuardFactory service", async () => {
      class MyGuard implements IGuardFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}

        createGuard(): GuardFunction {
          return (req) => {
            this.logger.debug("IGuardFactory service works!");
            return req.headers[secretHeaderKey] === secretHeaderValue;
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupHttpPipeline((pipeline) => {
          pipeline.useGuard(MyGuard);

          pipeline.get("/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }));
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers });

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
