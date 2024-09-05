import { HTTP_STATUS_CODES, HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { JwtSigner } from "./JwtSigner";
import { IHttpServer } from "@/server";
import { ServerResponse } from "@/server";
import { testHttpServer } from "@/test";
import { Claims } from "@/auth";
import { jwtPolicy } from "./JwtPolicy";

describe("jwt/JwtPolicy", () => {
  const client = new HttpClient();
  const secret = "foo bar fizz buzz";
  const claims = new Claims({ foo: "bar", fizz: "buzz" });
  const token = new JwtSigner({ secret }).sign(claims);
  const myJwtPolicy = jwtPolicy({ secret });

  let server: IHttpServer;

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
      .useEndpoint("GET", "/", () => new ServerResponse({ status: HTTP_STATUS_CODES.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(HTTP_STATUS_CODES.unauthorized);
  });

  it("should be authorized by jwt policy at global level", async () => {
    await server
      .useAuthentication(myJwtPolicy)
      .useEndpoint("GET", "/", ({ user }) => {
        expect(user.authenticated).toBe(true);
        expect(user.claims.toPlain()).toMatchObject(claims.toPlain());
        return new ServerResponse({ status: HTTP_STATUS_CODES.ok });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${token}`),
    });

    expect(response.isSuccess).toBe(true);
  });

  it("should be denied by jwt policy at endpoint level", async () => {
    let counter = 0;

    await server
      .useEndpoint(
        "GET",
        "/",
        () => {
          counter += 1; // this should not be reached!
          return new ServerResponse({ status: HTTP_STATUS_CODES.ok });
        },
        {
          authentication: myJwtPolicy,
        }
      )
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(HTTP_STATUS_CODES.unauthorized);

    expect(counter).toBe(0);
  });

  it("should be authorized by jwt policy at endpoint level", async () => {
    let counter = 0;

    await server
      .useEndpoint(
        "GET",
        "/",
        ({ user }) => {
          expect(user.authenticated).toBe(true);
          expect(user.claims.toPlain()).toMatchObject(claims.toPlain());
          counter += 1;
          return new ServerResponse({ status: HTTP_STATUS_CODES.ok });
        },
        {
          authentication: myJwtPolicy,
        }
      )
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${token}`),
    });

    expect(response.status).toBe(HTTP_STATUS_CODES.ok);

    expect(counter).toBe(1);
  });
});
