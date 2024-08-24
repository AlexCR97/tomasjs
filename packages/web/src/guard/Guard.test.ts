import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { IHttpServer, IRequestContext } from "@/server";
import { HttpResponse } from "@/server";
import { statusCode } from "@/StatusCode";
import { GuardFunction, guard, isGuardFunction } from "./Guard";
import { testHttpServer } from "@/test";

describe("server/Guard", () => {
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

  describe(guard.name, () => {
    const client = new HttpClient();
    const apiKeyHeader = "x-api-key";
    const apiKeyValue = "foo bar fizz buzz";

    const myGuardFunction: GuardFunction = ({ req }) => {
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
