import { HttpClient, JsonContent } from "@tomasjs/core/http";
import { HttpResponse, IHttpServer, IRequestContext } from "@/server";
import { statusCode } from "@/StatusCode";
import { testHttpServer } from "@/test";
import {
  IInterceptor,
  IInterceptorFactory,
  InterceptorFactoryFunction,
  InterceptorFunction,
  interceptor,
  isIInterceptor,
  isIInterceptorFactory,
  isInterceptorFactoryFunction,
  isInterceptorFunction,
} from "./Interceptor";

describe("Interceptor", () => {
  describe("with HttpServer", () => {
    const client = new HttpClient();

    const myInterceptor: InterceptorFunction = (req) => {
      req.user.authenticate();
    };

    let server: IHttpServer;

    beforeEach(async () => {
      server = await testHttpServer();
    });

    afterEach(async () => {
      if (server) {
        await server.stop();
      }
    });

    it("should use interceptor middleware", async () => {
      await server
        .use(interceptor(myInterceptor))
        .useEndpoint("GET", "/", (req) => {
          const response = { authenticated: req.user.authenticated } as const;
          return new HttpResponse({
            status: statusCode.ok,
            content: JsonContent.from(response),
          });
        })
        .start();

      const response = await client.get(`http://localhost:${server.port}`);

      expect(response.isSuccess).toBe(true);

      const responseJson = response.body.readData();

      expect(responseJson).toMatchObject({ authenticated: true });
    });

    it("should use interceptor middleware shorthand", async () => {
      await server
        .useInterceptor(myInterceptor)
        .useEndpoint("GET", "/", (req) => {
          const response = { authenticated: req.user.authenticated } as const;
          return new HttpResponse({
            status: statusCode.ok,
            content: JsonContent.from(response),
          });
        })
        .start();

      const response = await client.get(`http://localhost:${server.port}`);

      expect(response.isSuccess).toBe(true);

      const responseJson = response.body.readData();

      expect(responseJson).toMatchObject({ authenticated: true });
    });
  });

  // TODO Rename test suite
  describe("with WebAppBuilder", () => {
    describe(isInterceptorFunction.name, () => {
      it("should return true for named functions", () => {
        const arrowFunction: InterceptorFunction = (req) => {};
        expect(isInterceptorFunction(arrowFunction)).toBe(true);

        const inlineFunction: InterceptorFunction = function (req) {};
        expect(isInterceptorFunction(inlineFunction)).toBe(true);

        function declaredFunction(req: IRequestContext) {}
        expect(isInterceptorFunction(declaredFunction)).toBe(true);
      });

      it("should return true for anonymous functions", () => {
        expect(isInterceptorFunction((req: IRequestContext) => {})).toBe(true);

        expect(isInterceptorFunction(function (req: IRequestContext) {})).toBe(true);
      });

      it("should return false for functions with params out of range", () => {
        expect(isInterceptorFunction((req: IRequestContext, invalid: any) => {})).toBe(false);
      });
    });

    describe(isIInterceptor.name, () => {
      it("should return true for an interceptor instance", () => {
        class TestInterceptor implements IInterceptor {
          intercept(req: IRequestContext): void {}
        }

        const myInterceptor = new TestInterceptor();
        expect(isIInterceptor(myInterceptor)).toBe(true);
      });

      it("should return true for an interceptor instance with an async method", () => {
        class TestInterceptor implements IInterceptor {
          async intercept(req: IRequestContext): Promise<void> {}
        }

        const myInterceptor = new TestInterceptor();
        expect(isIInterceptor(myInterceptor)).toBe(true);
      });

      it("should return true for an interceptor object with an arrow function", () => {
        const myInterceptor: IInterceptor = {
          intercept: (req) => {},
        };

        expect(isIInterceptor(myInterceptor)).toBe(true);
      });

      it("should return true for an interceptor object with a declared function", () => {
        const myInterceptor: IInterceptor = {
          intercept(req) {},
        };

        expect(isIInterceptor(myInterceptor)).toBe(true);
      });
    });

    describe(isInterceptorFactoryFunction.name, () => {
      it("should return true for named functions", () => {
        const arrowFunction: InterceptorFactoryFunction = () => {
          return (req) => {};
        };
        expect(isInterceptorFactoryFunction(arrowFunction)).toBe(true);

        const inlineFunction: InterceptorFactoryFunction = function (): InterceptorFunction {
          return (req) => {};
        };
        expect(isInterceptorFactoryFunction(inlineFunction)).toBe(true);

        function declaredFunction(): InterceptorFunction {
          return (req) => {};
        }
        expect(isInterceptorFactoryFunction(declaredFunction)).toBe(true);
      });

      it("should return true for anonymous functions", () => {
        expect(
          isInterceptorFactoryFunction(() => {
            return (req: IRequestContext) => {};
          })
        ).toBe(true);

        expect(
          isInterceptorFactoryFunction(function (): InterceptorFunction {
            return function (req: IRequestContext) {};
          })
        ).toBe(true);
      });

      it("should return true for functions with params in range", () => {
        expect(
          isInterceptorFactoryFunction(() => {
            return (req: IRequestContext) => {};
          })
        ).toBe(true);
      });

      it("should return false for functions with params out of range", () => {
        expect(
          isInterceptorFactoryFunction((arg1: any) => {
            return (req: IRequestContext) => {};
          })
        ).toBe(false);

        expect(
          isInterceptorFactoryFunction((arg1: any, arg2: any) => {
            return (req: IRequestContext) => {};
          })
        ).toBe(false);
        expect(
          isInterceptorFactoryFunction((arg1: any, arg2: any, arg3: any) => {
            return (req: IRequestContext) => {};
          })
        ).toBe(false);
      });
    });

    describe(isIInterceptorFactory.name, () => {
      it("should return true for an instance", () => {
        class TestInterceptor implements IInterceptorFactory {
          createInterceptor(): InterceptorFunction {
            return (req) => {};
          }
        }

        const myInterceptor = new TestInterceptor();
        expect(isIInterceptorFactory(myInterceptor)).toBe(true);
      });

      it("should return true for an object with an arrow function", () => {
        const myInterceptor: IInterceptorFactory = {
          createInterceptor: () => {
            return (req) => {};
          },
        };

        expect(isIInterceptorFactory(myInterceptor)).toBe(true);
      });

      it("should return true for an object with a declared function", () => {
        const myInterceptor: IInterceptorFactory = {
          createInterceptor() {
            return (req) => {};
          },
        };

        expect(isIInterceptorFactory(myInterceptor)).toBe(true);
      });
    });
  });
});
