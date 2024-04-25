import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { statusCodes } from "@/statusCodes";
import { JwtSigner } from "./JwtSigner";
import { jwtGuard } from "./JwtGuard";
import { HttpServer } from "@/server/HttpServer";
import { EndpointResponse } from "@/server/Endpoint";
import { testHttpServer } from "@/test";
import { Claims } from "@/auth";

describe("JwtGuard", () => {
  const client = new HttpClient();
  const secret = "foo bar fizz buzz";
  const claims = new Claims({ foo: "bar", fizz: "buzz" });
  const token = new JwtSigner({ secret }).sign(claims);
  const myJwtGuard = jwtGuard({ secret });

  let server: HttpServer;

  beforeEach(async () => {
    server = await testHttpServer();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it("should be denied by jwt guard", async () => {
    await server
      .useGuard(myJwtGuard)
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCodes.unauthorized);
  });

  it("should be authorized by jwt guard", async () => {
    await server
      .useGuard(myJwtGuard)
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${token}`),
    });

    expect(response.ok).toBe(true);
  });
});
