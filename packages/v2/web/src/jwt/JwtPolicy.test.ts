import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { statusCodes } from "@/statusCodes";
import { JwtSigner } from "./JwtSigner";
import { HttpServer } from "@/server";
import { EndpointResponse } from "@/endpoint";
import { testHttpServer } from "@/test";
import { Claims } from "@/auth";
import { jwtPolicy } from "./JwtPolicy";

describe("JwtPolicy", () => {
  const client = new HttpClient();
  const secret = "foo bar fizz buzz";
  const claims = new Claims({ foo: "bar", fizz: "buzz" });
  const token = new JwtSigner({ secret }).sign(claims);
  const myJwtPolicy = jwtPolicy({ secret });

  let server: HttpServer;

  beforeEach(async () => {
    server = await testHttpServer();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it("should be denied by jwt policy at global level", async () => {
    await server
      .useAuthentication(myJwtPolicy)
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCodes.unauthorized);
  });

  it("should be authorized by jwt policy at global level", async () => {
    await server
      .useAuthentication(myJwtPolicy)
      .useEndpoint("get", "/", ({ user }) => {
        expect(user.authenticated).toBe(true);
        expect(user.claims.toPlain()).toMatchObject(claims.toPlain());
        return new EndpointResponse({ status: statusCodes.ok });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${token}`),
    });

    expect(response.ok).toBe(true);
  });

  it("should be denied by jwt policy at endpoint level", async () => {
    let counter = 0;

    await server
      .useEndpoint(
        "get",
        "/",
        () => {
          counter += 1; // this should not be reached!
          return new EndpointResponse({ status: statusCodes.ok });
        },
        {
          authentication: myJwtPolicy,
        }
      )
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCodes.unauthorized);

    expect(counter).toBe(0);
  });

  it("should be authorized by jwt policy at endpoint level", async () => {
    let counter = 0;

    await server
      .useEndpoint(
        "get",
        "/",
        ({ user }) => {
          expect(user.authenticated).toBe(true);
          expect(user.claims.toPlain()).toMatchObject(claims.toPlain());
          counter += 1;
          return new EndpointResponse({ status: statusCodes.ok });
        },
        {
          authentication: myJwtPolicy,
        }
      )
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${token}`),
    });

    expect(response.status).toBe(statusCodes.ok);

    expect(counter).toBe(1);
  });
});
