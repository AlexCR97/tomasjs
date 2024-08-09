import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { IHttpServer, IRequestContext } from "@/server";
import { HttpResponse } from "@/server";
import { statusCode } from "@/StatusCode";
import {
  GuardFactoryFunction,
  GuardFunction,
  GuardResult,
  IGuard,
  IGuardFactory,
  guard,
  isGuardFactoryFunction,
  isGuardFunction,
  isIGuard,
  isIGuardFactory,
} from "./Guard";
import { testHttpServer } from "@/test";

describe("Guard", () => {
  describe("Type predicates", () => {
    describe(isGuardFunction.name, () => {
      it("should return true for named functions", () => {
        const arrowFunction: GuardFunction = (req) => true;
        expect(isGuardFunction(arrowFunction)).toBe(true);

        const inlineFunction: GuardFunction = function (req) {
          return true;
        };
        expect(isGuardFunction(inlineFunction)).toBe(true);

        function declaredFunction(req: IRequestContext) {
          return true;
        }
        expect(isGuardFunction(declaredFunction)).toBe(true);
      });

      it("should return true for anonymous functions", () => {
        expect(isGuardFunction((req: IRequestContext) => true)).toBe(true);

        expect(
          isGuardFunction(function (req: IRequestContext) {
            return true;
          })
        ).toBe(true);
      });

      it("should return false for functions with params out of range", () => {
        expect(isGuardFunction((req: IRequestContext, invalid: any) => true)).toBe(false);
      });
    });

    describe(isIGuard.name, () => {
      it("should return true for a guard instance", () => {
        class MyGuard implements IGuard {
          protect(req: IRequestContext): GuardResult {
            return true;
          }
        }

        const myGuard = new MyGuard();
        expect(isIGuard(myGuard)).toBe(true);
      });

      it("should return true for a guard instance with an async method", () => {
        class MyGuard implements IGuard {
          async protect(req: IRequestContext): Promise<GuardResult> {
            return true;
          }
        }

        const myGuard = new MyGuard();
        expect(isIGuard(myGuard)).toBe(true);
      });

      it("should return true for a guard object with an arrow function", () => {
        const myGuard: IGuard = {
          protect: (req) => true,
        };

        expect(isIGuard(myGuard)).toBe(true);
      });

      it("should return true for a guard object with a declared function", () => {
        const myGuard: IGuard = {
          protect(req) {
            return true;
          },
        };

        expect(isIGuard(myGuard)).toBe(true);
      });
    });

    describe(isGuardFactoryFunction.name, () => {
      it("should return true for named functions", () => {
        const arrowFunction: GuardFactoryFunction = () => {
          return (req) => true;
        };
        expect(isGuardFactoryFunction(arrowFunction)).toBe(true);

        const inlineFunction: GuardFactoryFunction = function (): GuardFunction {
          return (req) => true;
        };
        expect(isGuardFactoryFunction(inlineFunction)).toBe(true);

        function declaredFunction(): GuardFunction {
          return (req) => true;
        }
        expect(isGuardFactoryFunction(declaredFunction)).toBe(true);
      });

      it("should return true for anonymous functions", () => {
        expect(
          isGuardFactoryFunction(() => {
            return (req: IRequestContext) => true;
          })
        ).toBe(true);

        expect(
          isGuardFactoryFunction(function (): GuardFunction {
            return function (req: IRequestContext) {
              return true;
            };
          })
        ).toBe(true);
      });

      it("should return true for functions with params in range", () => {
        expect(
          isGuardFactoryFunction(() => {
            return (req: IRequestContext) => true;
          })
        ).toBe(true);
      });

      it("should return false for functions with params out of range", () => {
        expect(
          isGuardFactoryFunction((arg1: any) => {
            return (req: IRequestContext) => true;
          })
        ).toBe(false);

        expect(
          isGuardFactoryFunction((arg1: any, arg2: any) => {
            return (req: IRequestContext) => true;
          })
        ).toBe(false);
        expect(
          isGuardFactoryFunction((arg1: any, arg2: any, arg3: any) => {
            return (req: IRequestContext) => true;
          })
        ).toBe(false);
      });
    });

    describe(isIGuardFactory.name, () => {
      it("should return true for an instance", () => {
        class MyGuard implements IGuardFactory {
          createGuard(): GuardFunction {
            return (req) => true;
          }
        }

        const myGuard = new MyGuard();
        expect(isIGuardFactory(myGuard)).toBe(true);
      });

      it("should return true for an object with an arrow function", () => {
        const myGuard: IGuardFactory = {
          createGuard: () => {
            return (req) => true;
          },
        };

        expect(isIGuardFactory(myGuard)).toBe(true);
      });

      it("should return true for an object with a declared function", () => {
        const myGuard: IGuardFactory = {
          createGuard() {
            return (req) => true;
          },
        };

        expect(isIGuardFactory(myGuard)).toBe(true);
      });
    });
  });

  describe("with HttpServer", () => {
    const client = new HttpClient();
    const apiKeyHeader = "x-api-key";
    const apiKeyValue = "foo bar fizz buzz";

    const myGuardFunction: GuardFunction = (req) => {
      const apiKey = req.headers[apiKeyHeader];
      return apiKey === apiKeyValue;
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

    it("should use guard middleware", async () => {
      await server
        .use(guard(myGuardFunction))
        .useEndpoint("GET", "/", () => new HttpResponse({ status: statusCode.ok }))
        .start();

      const response = await client.get(`http://localhost:${server.port}`, {
        headers: new HttpHeaders().add(apiKeyHeader, apiKeyValue),
      });

      expect(response.isSuccess).toBe(true);
    });

    it("should use guard middleware shorthand", async () => {
      await server
        .useGuard(myGuardFunction)
        .useEndpoint("GET", "/", () => new HttpResponse({ status: statusCode.ok }))
        .start();

      const response = await client.get(`http://localhost:${server.port}`, {
        headers: new HttpHeaders().add(apiKeyHeader, apiKeyValue),
      });

      expect(response.isSuccess).toBe(true);
    });

    it("should deny unauthorized requests", async () => {
      await server
        .useGuard(myGuardFunction)
        .useEndpoint("GET", "/", () => new HttpResponse({ status: statusCode.ok }))
        .start();

      const response = await client.get(`http://localhost:${server.port}`);

      expect(response.status).toBe(statusCode.unauthorized);

      const responseJson = response.body.readData();
    });

    it("should apply multiple guards", async () => {
      await server
        .useGuard(() => {
          return true;
        })
        .useGuard(() => {
          return true;
        })
        .useGuard(() => {
          return true;
        })
        .useEndpoint("GET", "/", () => new HttpResponse({ status: statusCode.ok }))
        .start();

      const response = await client.get(`http://localhost:${server.port}`);

      expect(response.status).toBe(statusCode.ok);
    });
  });
});
