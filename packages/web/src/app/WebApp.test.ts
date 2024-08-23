import "reflect-metadata";
import { inject } from "@tomasjs/core/dependency-injection";
import {
  HTTP_STATUS_CODES,
  HttpClient,
  HttpHeaders,
  IHttpClient,
  JsonContent,
  PlainTextContent,
} from "@tomasjs/core/http";
import { ILogger, LOGGER, LoggerConfiguration } from "@tomasjs/core/logging";
import { testHttpServer } from "@/test";
import { WebApp, WebAppBuilder } from "./WebApp";
import { jwtPolicy, JwtSigner } from "@/jwt";
import {
  IMiddleware,
  IMiddlewareFactory,
  MiddlewareContext,
  MiddlewareFunction,
} from "./Middleware";
import { ErrorHandlerFunction, IErrorHandler, IErrorHandlerFactory } from "./ErrorHandler";
import {
  IInterceptor,
  IInterceptorFactory,
  InterceptorContext,
  InterceptorFunction,
} from "./Interceptor";
import { GuardFunction, GuardResult, IGuard, IGuardFactory } from "./Guard";
import {
  AuthenticationPolicyFunction,
  AuthenticationPolicyResult,
  IAuthenticationPolicy,
  IAuthenticationPolicyFactory,
} from "./Authentication";
import {
  AuthorizationPolicyFunction,
  IAuthorizationPolicy,
  IAuthorizationPolicyFactory,
} from "./Authorization";
import { Endpoint } from "./Endpoint";
import { IRequestContext, IRequestContextReader } from "./RequestContext";
import { HttpResponse, IHttpServer, IResponseWriter } from "@/server";
import { Claims, rolePolicy } from "@/auth";

// TODO Rename test suite
describe("x-WebApp", () => {
  const loggerConfig: LoggerConfiguration = {
    default: {
      level: "fatal",
    },
  };

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
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.use(async ({ req, res }) => {
            const logger = req.services.getOrThrow<ILogger>(LOGGER);
            logger.debug("MiddlewareFunction works!");
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
        async run({ res }: MiddlewareContext): Promise<void> {
          return await res.withStatus(HTTP_STATUS_CODES.ok).send();
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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
        async run({ res }: MiddlewareContext): Promise<void> {
          this.logger.debug("IMiddleware service works!");
          return await res.withStatus(HTTP_STATUS_CODES.ok).send();
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.use(MyMiddleware);
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.isSuccess).toBe(true);
    });

    it("should use an IMiddlewareFactory", async () => {
      class MyMiddlewareFactory implements IMiddlewareFactory {
        createMiddleware(): MiddlewareFunction | IMiddleware {
          return async ({ req, res, next }) => {
            return await res.withStatus(HTTP_STATUS_CODES.ok).send();
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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
          return async ({ req, res, next }) => {
            this.logger.debug("It works!");
            return await res.withStatus(HTTP_STATUS_CODES.ok).send();
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useInterceptor(({ req }) => {
            const logger = req.services.getOrThrow<ILogger>(LOGGER);
            logger.debug("InterceptorFunction works!");
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
        intercept({ req }: InterceptorContext): void | Promise<void> {
          req.user.authenticate();
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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
        intercept({ req }: InterceptorContext): void | Promise<void> {
          this.logger.debug("IInterceptor service works!");
          req.user.authenticate();
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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

    it("should use an IInterceptorFactory", async () => {
      class MyInterceptor implements IInterceptorFactory {
        createInterceptor(): InterceptorFunction {
          return async ({ req }) => {
            req.user.authenticate();
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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
          return async ({ req }) => {
            this.logger.debug("IInterceptorFactory service works!");
            req.user.authenticate();
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useGuard((req) => {
            const logger = req.services.getOrThrow<ILogger>(LOGGER);
            logger.debug("GuardFunction works!");
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
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useGuard(MyGuard);

          pipeline.get("/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }));
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IGuardFactory", async () => {
      class MyGuard implements IGuardFactory {
        createGuard(): GuardFunction {
          return (req) => {
            return req.headers[secretHeaderKey] === secretHeaderValue;
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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

  describe("useAuthentication", () => {
    const secret = "foo bar fizz buzz";
    const claims = new Claims({ foo: "bar", fizz: "buzz" });
    const token = new JwtSigner({ secret }).sign(claims);

    it("should use an AuthenticationPolicyFunction", async () => {
      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication((context) => {
            const logger = context.services.getOrThrow<ILogger>(LOGGER);
            logger.debug("AuthenticationPolicyFunction works!");
            const policy = jwtPolicy({ secret });
            return policy(context);
          });

          pipeline.get("/", ({ services, user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.claims.toPlain()).toMatchObject(claims.toPlain());
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IAuthenticationPolicy", async () => {
      class MyPolicy implements IAuthenticationPolicy {
        authenticate(
          req: IRequestContext
        ): AuthenticationPolicyResult | Promise<AuthenticationPolicyResult> {
          const policy = jwtPolicy({ secret });
          return policy(req);
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication(new MyPolicy());

          pipeline.get("/", ({ user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.claims.toPlain()).toMatchObject(claims.toPlain());
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IAuthenticationPolicy service", async () => {
      class MyPolicy implements IAuthenticationPolicy {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}

        authenticate(
          req: IRequestContext
        ): AuthenticationPolicyResult | Promise<AuthenticationPolicyResult> {
          this.logger.debug("IAuthenticationPolicy service works!");
          const policy = jwtPolicy({ secret });
          return policy(req);
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication(MyPolicy);

          pipeline.get("/", ({ user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.claims.toPlain()).toMatchObject(claims.toPlain());
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IAuthenticationPolicyFactory ", async () => {
      class MyPolicy implements IAuthenticationPolicyFactory {
        createAuthenticationPolicy(): AuthenticationPolicyFunction {
          return jwtPolicy({ secret });
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication(new MyPolicy());

          pipeline.get("/", ({ user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.claims.toPlain()).toMatchObject(claims.toPlain());
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IAuthenticationPolicyFactory service", async () => {
      class MyPolicy implements IAuthenticationPolicyFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}

        createAuthenticationPolicy(): AuthenticationPolicyFunction | IAuthenticationPolicy {
          this.logger.debug("IAuthenticationPolicyFactory service works!");
          return jwtPolicy({ secret });
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication(MyPolicy);

          pipeline.get("/", ({ user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.claims.toPlain()).toMatchObject(claims.toPlain());
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });
  });

  describe("useAuthorization", () => {
    const secret = "foo bar fizz buzz";
    const role = "admin";
    const claims = new Claims({ role });
    const token = new JwtSigner({ secret }).sign(claims);

    it("should use an AuthorizationPolicyFunction", async () => {
      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication(jwtPolicy({ secret }));

          pipeline.useAuthorization((context) => {
            const logger = context.services.getOrThrow<ILogger>(LOGGER);
            logger.debug("AuthorizationPolicyFunction works!");
            const policy = rolePolicy(role);
            return policy(context);
          });

          pipeline.get("/", ({ user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.authorized).toBe(true);
            expect(user.claims.has("role")).toBe(true);
            expect(user.claims.get("role")).toMatch(role);
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IAuthorizationPolicy", async () => {
      class MyPolicy implements IAuthorizationPolicy {
        authorize(req: IRequestContextReader): boolean | Promise<boolean> {
          const policy = rolePolicy(role);
          return policy(req);
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication(jwtPolicy({ secret }));

          pipeline.useAuthorization(new MyPolicy());

          pipeline.get("/", ({ user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.authorized).toBe(true);
            expect(user.claims.has("role")).toBe(true);
            expect(user.claims.get("role")).toMatch(role);
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IAuthorizationPolicy service", async () => {
      class MyPolicy implements IAuthorizationPolicy {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}

        authorize(req: IRequestContextReader): boolean | Promise<boolean> {
          this.logger.debug("IAuthorizationPolicy service works!");
          const policy = rolePolicy(role);
          return policy(req);
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication(jwtPolicy({ secret }));

          pipeline.useAuthorization(MyPolicy);

          pipeline.get("/", ({ user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.authorized).toBe(true);
            expect(user.claims.has("role")).toBe(true);
            expect(user.claims.get("role")).toMatch(role);
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IAuthorizationPolicyFactory", async () => {
      class MyPolicy implements IAuthorizationPolicyFactory {
        createAuthorizationPolicy(): AuthorizationPolicyFunction {
          return rolePolicy(role);
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication(jwtPolicy({ secret }));

          pipeline.useAuthorization(new MyPolicy());

          pipeline.get("/", ({ user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.authorized).toBe(true);
            expect(user.claims.has("role")).toBe(true);
            expect(user.claims.get("role")).toMatch(role);
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should use an IAuthorizationPolicyFactory service", async () => {
      class MyPolicy implements IAuthorizationPolicyFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        createAuthorizationPolicy(): AuthorizationPolicyFunction {
          this.logger.debug("IAuthorizationPolicyFactory service works!");
          return rolePolicy(role);
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useAuthentication(jwtPolicy({ secret }));

          pipeline.useAuthorization(MyPolicy);

          pipeline.get("/", ({ user }) => {
            expect(user.authenticated).toBe(true);
            expect(user.authorized).toBe(true);
            expect(user.claims.has("role")).toBe(true);
            expect(user.claims.get("role")).toMatch(role);
            return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
          });
        })
        .build();

      await app.start();

      const response = await client.get("/", { headers: { authorization: `Bearer ${token}` } });

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });
  });

  describe("useEndpoint", () => {
    it("should map an endpoint", async () => {
      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
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
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useEndpoint(
            "GET",
            "/",
            ({ services }) => {
              const logger = services.getOrThrow<ILogger>(LOGGER);
              logger.debug("Endpoint with shorthand works!");
              return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
            },
            {
              guards: [() => true],
            }
          );
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should map an endpoint with the GET shorthand", async () => {
      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.get(
            "/",
            ({ services }) => {
              const logger = services.getOrThrow<ILogger>(LOGGER);
              logger.debug("Endpoint with GET shorthand works!");
              return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
            },
            {
              guards: [() => true],
            }
          );
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    });

    it("should receive a route parameter", async () => {
      const testParams = {
        userId: "22",
        orderId: "47",
      } as const;

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.get("/users/:userId/orders/:orderId", ({ params, services }) => {
            const logger = services.getOrThrow<ILogger>(LOGGER);

            const userId = params.getOrThrow("userId");
            logger.debug("User ID: {userId}", { userId });
            expect(userId).toMatch(testParams.userId);

            const orderId = params.getOrThrow("orderId");
            logger.debug("Order ID: {orderId}", { orderId });
            expect(orderId).toMatch(testParams.orderId);

            return new HttpResponse({
              status: HTTP_STATUS_CODES.ok,
              content: JsonContent.from(params.toPlain()),
            });
          });
        })
        .build();

      await app.start();

      const response = await client.get(`/users/${testParams.userId}/orders/${testParams.orderId}`);
      expect(response.status).toBe(HTTP_STATUS_CODES.ok);

      const responseContent = await response.body.readData();
      expect(responseContent).toMatchObject(testParams);
    });

    it("should apply middleware at the endpoint level with functions", async () => {
      const aggregation: string[] = [];

      function myMiddleware(prefix: string): MiddlewareFunction {
        return ({ req, res, next }) => {
          aggregation.push(`${prefix}-middleware`);
          return next();
        };
      }

      function myInterceptor(prefix: string): InterceptorFunction {
        return (req) => {
          aggregation.push(`${prefix}-interceptor`);
        };
      }

      function myGuard(prefix: string): GuardFunction {
        return (req) => {
          aggregation.push(`${prefix}-guard`);
          return true;
        };
      }

      function myAuthenticationPolicy(prefix: string): AuthenticationPolicyFunction {
        return ({ user }) => {
          aggregation.push(`${prefix}-authentication`);
          user.authenticate();
          return true;
        };
      }

      function myAuthorizationPolicy(prefix: string): AuthorizationPolicyFunction {
        return () => {
          aggregation.push(`${prefix}-authorization`);
          return true;
        };
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.use(myMiddleware("global"));

          pipeline.useInterceptor(myInterceptor("global"));

          pipeline.useGuard(myGuard("global"));

          pipeline.useAuthentication(myAuthenticationPolicy("global"));

          pipeline.useAuthorization(myAuthorizationPolicy("global"));

          pipeline.useEndpoint(
            Endpoint.get("/a", ({ user }) => {
              expect(user.authenticated).toBe(true);
              expect(user.authorized).toBe(true);
              return new HttpResponse({
                status: HTTP_STATUS_CODES.ok,
                content: JsonContent.from(aggregation),
              });
            })
              .use(myMiddleware("endpoint-a"))
              .useInterceptor(myInterceptor("endpoint-a"))
              .useGuard(myGuard("endpoint-a"))
              .useAuthentication(myAuthenticationPolicy("endpoint-a"))
              .useAuthorization(myAuthorizationPolicy("endpoint-a"))
          );

          pipeline.useEndpoint(
            Endpoint.get("/b", ({ user }) => {
              expect(user.authenticated).toBe(true);
              expect(user.authorized).toBe(true);
              return new HttpResponse({
                status: HTTP_STATUS_CODES.ok,
                content: JsonContent.from(aggregation),
              });
            })
              .use(myMiddleware("endpoint-b"))
              .useInterceptor(myInterceptor("endpoint-b"))
              .useGuard(myGuard("endpoint-b"))
              .useAuthentication(myAuthenticationPolicy("endpoint-b"))
              .useAuthorization(myAuthorizationPolicy("endpoint-b"))
          );
        })
        .build();

      await app.start();

      const responseA = await client.getJson<string[]>("/a");

      expect(responseA).toMatchObject([
        "global-middleware",
        "global-interceptor",
        "global-guard",
        "global-authentication",
        "global-authorization",
        "endpoint-a-middleware",
        "endpoint-a-interceptor",
        "endpoint-a-guard",
        "endpoint-a-authentication",
        "endpoint-a-authorization",
      ]);

      const responseB = await client.getJson<string[]>("/b");

      expect(responseB).toMatchObject([
        "global-middleware",
        "global-interceptor",
        "global-guard",
        "global-authentication",
        "global-authorization",
        "endpoint-a-middleware",
        "endpoint-a-interceptor",
        "endpoint-a-guard",
        "endpoint-a-authentication",
        "endpoint-a-authorization",
        "global-middleware",
        "global-interceptor",
        "global-guard",
        "global-authentication",
        "global-authorization",
        "endpoint-b-middleware",
        "endpoint-b-interceptor",
        "endpoint-b-guard",
        "endpoint-b-authentication",
        "endpoint-b-authorization",
      ]);
    });

    it("should apply middleware at the endpoint level with interfaces", async () => {
      const aggregation: string[] = [];

      class MyMiddleware implements IMiddleware {
        constructor(private readonly prefix: string) {}
        async run({ next }: MiddlewareContext): Promise<void> {
          aggregation.push(`${this.prefix}-middleware`);
          return next();
        }
      }

      class MyInterceptor implements IInterceptor {
        constructor(private readonly prefix: string) {}
        intercept({ req }: InterceptorContext): void | Promise<void> {
          aggregation.push(`${this.prefix}-interceptor`);
        }
      }

      class MyGuard implements IGuard {
        constructor(private readonly prefix: string) {}
        protect(req: IRequestContext): GuardResult | Promise<GuardResult> {
          aggregation.push(`${this.prefix}-guard`);
          return true;
        }
      }

      class MyAuthenticationPolicy implements IAuthenticationPolicy {
        constructor(private readonly prefix: string) {}
        authenticate({
          user,
        }: IRequestContext): AuthenticationPolicyResult | Promise<AuthenticationPolicyResult> {
          aggregation.push(`${this.prefix}-authentication`);
          user.authenticate();
          return true;
        }
      }

      class MyAuthorizationPolicy implements IAuthorizationPolicy {
        constructor(private readonly prefix: string) {}
        authorize(req: IRequestContextReader): boolean | Promise<boolean> {
          aggregation.push(`${this.prefix}-authorization`);
          return true;
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.use(new MyMiddleware("global"));

          pipeline.useInterceptor(new MyInterceptor("global"));

          pipeline.useGuard(new MyGuard("global"));

          pipeline.useAuthentication(new MyAuthenticationPolicy("global"));

          pipeline.useAuthorization(new MyAuthorizationPolicy("global"));

          pipeline.useEndpoint(
            Endpoint.get("/a", ({ user }) => {
              expect(user.authenticated).toBe(true);
              expect(user.authorized).toBe(true);
              return new HttpResponse({
                status: HTTP_STATUS_CODES.ok,
                content: JsonContent.from(aggregation),
              });
            })
              .use(new MyMiddleware("endpoint-a"))
              .useInterceptor(new MyInterceptor("endpoint-a"))
              .useGuard(new MyGuard("endpoint-a"))
              .useAuthentication(new MyAuthenticationPolicy("endpoint-a"))
              .useAuthorization(new MyAuthorizationPolicy("endpoint-a"))
          );

          pipeline.useEndpoint(
            Endpoint.get("/b", ({ user }) => {
              expect(user.authenticated).toBe(true);
              expect(user.authorized).toBe(true);
              return new HttpResponse({
                status: HTTP_STATUS_CODES.ok,
                content: JsonContent.from(aggregation),
              });
            })
              .use(new MyMiddleware("endpoint-b"))
              .useInterceptor(new MyInterceptor("endpoint-b"))
              .useGuard(new MyGuard("endpoint-b"))
              .useAuthentication(new MyAuthenticationPolicy("endpoint-b"))
              .useAuthorization(new MyAuthorizationPolicy("endpoint-b"))
          );
        })
        .build();

      await app.start();

      const responseA = await client.getJson<string[]>("/a");

      expect(responseA).toMatchObject([
        "global-middleware",
        "global-interceptor",
        "global-guard",
        "global-authentication",
        "global-authorization",
        "endpoint-a-middleware",
        "endpoint-a-interceptor",
        "endpoint-a-guard",
        "endpoint-a-authentication",
        "endpoint-a-authorization",
      ]);

      const responseB = await client.getJson<string[]>("/b");

      expect(responseB).toMatchObject([
        "global-middleware",
        "global-interceptor",
        "global-guard",
        "global-authentication",
        "global-authorization",
        "endpoint-a-middleware",
        "endpoint-a-interceptor",
        "endpoint-a-guard",
        "endpoint-a-authentication",
        "endpoint-a-authorization",
        "global-middleware",
        "global-interceptor",
        "global-guard",
        "global-authentication",
        "global-authorization",
        "endpoint-b-middleware",
        "endpoint-b-interceptor",
        "endpoint-b-guard",
        "endpoint-b-authentication",
        "endpoint-b-authorization",
      ]);
    });

    it("should apply middleware at the endpoint level with services", async () => {
      const aggregation: string[] = [];

      class MyMiddleware implements IMiddleware {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        run({ next }: MiddlewareContext): void | Promise<void> {
          this.logger.debug("Middleware works");
          aggregation.push(`middleware`);
          return next();
        }
      }

      class MyInterceptor implements IInterceptor {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        intercept(context: InterceptorContext): void | Promise<void> {
          this.logger.debug("Interceptor works");
          aggregation.push(`interceptor`);
        }
      }

      class MyGuard implements IGuard {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        protect(req: IRequestContext): GuardResult | Promise<GuardResult> {
          this.logger.debug("Guard works");
          aggregation.push(`guard`);
          return true;
        }
      }

      class MyAuthenticationPolicy implements IAuthenticationPolicy {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        authenticate({
          user,
        }: IRequestContext): AuthenticationPolicyResult | Promise<AuthenticationPolicyResult> {
          this.logger.debug("Authentication works");
          aggregation.push(`authentication`);
          user.authenticate();
          return true;
        }
      }

      class MyAuthorizationPolicy implements IAuthorizationPolicy {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        authorize(req: IRequestContextReader): boolean | Promise<boolean> {
          this.logger.debug("Authorization works");
          aggregation.push(`authorization`);
          return true;
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.use(MyMiddleware);

          pipeline.useInterceptor(MyInterceptor);

          pipeline.useGuard(MyGuard);

          pipeline.useAuthentication(MyAuthenticationPolicy);

          pipeline.useAuthorization(MyAuthorizationPolicy);

          pipeline.useEndpoint(
            Endpoint.get("/a", ({ user }) => {
              expect(user.authenticated).toBe(true);
              expect(user.authorized).toBe(true);
              return new HttpResponse({
                status: HTTP_STATUS_CODES.ok,
                content: JsonContent.from(aggregation),
              });
            })
              .use(MyMiddleware)
              .useInterceptor(MyInterceptor)
              .useGuard(MyGuard)
              .useAuthentication(MyAuthenticationPolicy)
              .useAuthorization(MyAuthorizationPolicy)
          );

          pipeline.useEndpoint(
            Endpoint.get("/b", ({ user }) => {
              expect(user.authenticated).toBe(true);
              expect(user.authorized).toBe(true);
              return new HttpResponse({
                status: HTTP_STATUS_CODES.ok,
                content: JsonContent.from(aggregation),
              });
            })
              .use(MyMiddleware)
              .useInterceptor(MyInterceptor)
              .useGuard(MyGuard)
              .useAuthentication(MyAuthenticationPolicy)
              .useAuthorization(MyAuthorizationPolicy)
          );
        })
        .build();

      await app.start();

      const responseA = await client.getJson<string[]>("/a");

      expect(responseA).toMatchObject([
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
      ]);

      const responseB = await client.getJson<string[]>("/b");

      expect(responseB).toMatchObject([
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
      ]);
    });

    it("should apply middleware at the endpoint level with factory services", async () => {
      const aggregation: string[] = [];

      class MyMiddleware implements IMiddlewareFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        createMiddleware(): MiddlewareFunction | IMiddleware {
          return ({ req, res, next }) => {
            this.logger.debug("Middleware works");
            aggregation.push(`middleware`);
            return next();
          };
        }
      }

      class MyInterceptor implements IInterceptorFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        createInterceptor(): InterceptorFunction | IInterceptor {
          return () => {
            this.logger.debug("Interceptor works");
            aggregation.push(`interceptor`);
          };
        }
      }

      class MyGuard implements IGuardFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        createGuard(): GuardFunction | IGuard {
          return (req) => {
            this.logger.debug("Guard works");
            aggregation.push(`guard`);
            return true;
          };
        }
      }

      class MyAuthenticationPolicy implements IAuthenticationPolicyFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        createAuthenticationPolicy(): AuthenticationPolicyFunction | IAuthenticationPolicy {
          return ({ user }) => {
            this.logger.debug("Authentication works");
            aggregation.push(`authentication`);
            user.authenticate();
            return true;
          };
        }
      }

      class MyAuthorizationPolicy implements IAuthorizationPolicyFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}
        createAuthorizationPolicy(): AuthorizationPolicyFunction | IAuthorizationPolicy {
          return () => {
            this.logger.debug("Authorization works");
            aggregation.push(`authorization`);
            return true;
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useErrorHandler(({ err }) => {
            throw err;
          });

          pipeline.use(MyMiddleware);

          pipeline.useInterceptor(MyInterceptor);

          pipeline.useGuard(MyGuard);

          pipeline.useAuthentication(MyAuthenticationPolicy);

          pipeline.useAuthorization(MyAuthorizationPolicy);

          pipeline.useEndpoint(
            Endpoint.get("/a", ({ user }) => {
              expect(user.authenticated).toBe(true);
              expect(user.authorized).toBe(true);
              return new HttpResponse({
                status: HTTP_STATUS_CODES.ok,
                content: JsonContent.from(aggregation),
              });
            })
              .use(MyMiddleware)
              .useInterceptor(MyInterceptor)
              .useGuard(MyGuard)
              .useAuthentication(MyAuthenticationPolicy)
              .useAuthorization(MyAuthorizationPolicy)
          );

          pipeline.useEndpoint(
            Endpoint.get("/b", ({ user }) => {
              expect(user.authenticated).toBe(true);
              expect(user.authorized).toBe(true);
              return new HttpResponse({
                status: HTTP_STATUS_CODES.ok,
                content: JsonContent.from(aggregation),
              });
            })
              .use(MyMiddleware)
              .useInterceptor(MyInterceptor)
              .useGuard(MyGuard)
              .useAuthentication(MyAuthenticationPolicy)
              .useAuthorization(MyAuthorizationPolicy)
          );
        })
        .build();

      await app.start();

      const responseA = await client.getJson<string[]>("/a");

      expect(responseA).toMatchObject([
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
      ]);

      const responseB = await client.getJson<string[]>("/b");

      expect(responseB).toMatchObject([
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
        "middleware",
        "interceptor",
        "guard",
        "authentication",
        "authorization",
      ]);
    });
  });

  describe("useErrorHandler", () => {
    const errorMessage = "Woops!";

    it("should use an ErrorHandlerFunction", async () => {
      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useErrorHandler(({ req, res, err }) => {
            const logger = req.services.getOrThrow<ILogger>(LOGGER);
            logger.error("ErrorHandlerFunction service works!");
            return res
              .withStatus(HTTP_STATUS_CODES.internalServerError)
              .withContent(PlainTextContent.from((err as Error).message))
              .send();
          });

          pipeline.get("/", () => {
            throw new Error(errorMessage);
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);
      expect(response.body.readData()).toMatch(errorMessage);
    });

    it("should use an IErrorHandler", async () => {
      class MyErrorHandler implements IErrorHandler {
        catch(req: IRequestContext, res: IResponseWriter, err: unknown): Promise<void> {
          return res
            .withStatus(HTTP_STATUS_CODES.internalServerError)
            .withContent(PlainTextContent.from((err as Error).message))
            .send();
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useErrorHandler(new MyErrorHandler());

          pipeline.get("/", () => {
            throw new Error(errorMessage);
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);
      expect(response.body.readData()).toMatch(errorMessage);
    });

    it("should use an IErrorHandler service", async () => {
      class MyErrorHandler implements IErrorHandler {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}

        catch(req: IRequestContext, res: IResponseWriter, err: unknown): Promise<void> {
          this.logger.error("IErrorHandler service works!");
          return res
            .withStatus(HTTP_STATUS_CODES.internalServerError)
            .withContent(PlainTextContent.from((err as Error).message))
            .send();
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useErrorHandler(MyErrorHandler);

          pipeline.get("/", () => {
            throw new Error(errorMessage);
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);
      expect(response.body.readData()).toMatch(errorMessage);
    });

    it("should use an IErrorHandlerFactory service", async () => {
      class MyErrorHandler implements IErrorHandlerFactory {
        createErrorHandler(): ErrorHandlerFunction {
          return ({ res, err }) => {
            return res
              .withStatus(HTTP_STATUS_CODES.internalServerError)
              .withContent(PlainTextContent.from((err as Error).message))
              .send();
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useErrorHandler(new MyErrorHandler());

          pipeline.get("/", () => {
            throw new Error(errorMessage);
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);
      expect(response.body.readData()).toMatch(errorMessage);
    });

    it("should use an IErrorHandlerFactory service", async () => {
      class MyErrorHandler implements IErrorHandlerFactory {
        constructor(@inject(LOGGER) private readonly logger: ILogger) {}

        createErrorHandler(): ErrorHandlerFunction {
          return ({ res, err }) => {
            this.logger.error("IErrorHandlerFactory service works!");
            return res
              .withStatus(HTTP_STATUS_CODES.internalServerError)
              .withContent(PlainTextContent.from((err as Error).message))
              .send();
          };
        }
      }

      app = await new WebAppBuilder({ server })
        .setupLogging((logging) => logging.withConfiguration(loggerConfig))
        .setupHttpPipeline((pipeline) => {
          pipeline.useErrorHandler(MyErrorHandler);

          pipeline.get("/", () => {
            throw new Error(errorMessage);
          });
        })
        .build();

      await app.start();

      const response = await client.get("/");

      expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);
      expect(response.body.readData()).toMatch(errorMessage);
    });
  });
});
