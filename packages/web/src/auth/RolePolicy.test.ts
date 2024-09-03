import { HTTP_STATUS_CODES, HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { HttpResponse, IHttpServer } from "@/server";
import { testHttpServer } from "@/test";
import { Claims } from "@/auth";
import { JwtSigner, jwtPolicy } from "@/jwt";
import { rolePolicy } from "./RolePolicy";

describe("auth/RolePolicy", () => {
  const client = new HttpClient();
  const secret = "foo bar fizz buzz";
  const myJwtPolicy = jwtPolicy({ secret });

  const adminRole = "admin";
  const adminClaims = new Claims({ role: adminRole });
  const adminToken = new JwtSigner({ secret }).sign(adminClaims);
  const adminRolePolicy = rolePolicy(adminRole);

  const readerRole = "reader";
  const readerClaims = new Claims({ role: readerRole });
  const readerToken = new JwtSigner({ secret }).sign(readerClaims);

  const adminOrReaderRolesPolicy = rolePolicy([adminRole, readerRole], { check: "any" });

  const adminAndReaderClaims = new Claims({ role: `${adminRole} ${readerRole}` });
  const adminAndReaderToken = new JwtSigner({ secret }).sign(adminAndReaderClaims);
  const adminAndReaderRolesPolicy = rolePolicy([adminRole, readerRole], { check: "all" });

  let server: IHttpServer;

  beforeEach(async () => {
    server = await testHttpServer();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it("should be unauthorized by admin role policy at global level", async () => {
    await server
      .useAuthentication(myJwtPolicy)
      .useAuthorization(adminRolePolicy)
      .useEndpoint("GET", "/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${readerToken}`),
    });

    expect(response.status).toBe(HTTP_STATUS_CODES.forbidden);
  });

  it("should be authorized by admin role policy at global level", async () => {
    await server
      .useAuthentication(myJwtPolicy)
      .useAuthorization(adminRolePolicy)
      .useEndpoint("GET", "/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${adminToken}`),
    });

    expect(response.status).toBe(HTTP_STATUS_CODES.ok);
  });

  it("should be unauthorized by admin role policy at endpoint level", async () => {
    let counter = 0;

    await server
      .useEndpoint(
        "GET",
        "/",
        () => {
          counter += 1; // this should not be reached!
          return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
        },
        {
          authentication: myJwtPolicy,
          authorization: adminRolePolicy,
        }
      )
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${readerToken}`),
    });

    expect(response.status).toBe(HTTP_STATUS_CODES.forbidden);
    expect(counter).toBe(0);
  });

  it("should be authorized by admin role policy at endpoint level", async () => {
    let counter = 0;

    await server
      .useEndpoint(
        "GET",
        "/",
        ({ user }) => {
          expect(user.authorized).toBe(true);
          counter += 1;
          return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
        },
        {
          authentication: myJwtPolicy,
          authorization: adminRolePolicy,
        }
      )
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${adminToken}`),
    });

    expect(response.status).toBe(HTTP_STATUS_CODES.ok);
    expect(counter).toBe(1);
  });

  it("should be authorized by admin OR reader role policy at endpoint level", async () => {
    await server
      .useEndpoint("GET", "/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }), {
        authentication: myJwtPolicy,
        authorization: adminOrReaderRolesPolicy,
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${readerToken}`),
    });

    expect(response.status).toBe(HTTP_STATUS_CODES.ok);
  });

  it("should be unauthorized by admin AND reader role policy at endpoint level", async () => {
    await server
      .useEndpoint("GET", "/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }), {
        authentication: myJwtPolicy,
        authorization: adminAndReaderRolesPolicy,
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${readerToken}`),
    });

    expect(response.status).toBe(HTTP_STATUS_CODES.forbidden);
  });

  it("should be authorized by admin AND reader role policy at endpoint level", async () => {
    await server
      .useEndpoint("GET", "/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }), {
        authentication: myJwtPolicy,
        authorization: adminAndReaderRolesPolicy,
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${adminAndReaderToken}`),
    });

    expect(response.status).toBe(HTTP_STATUS_CODES.ok);
  });
});
