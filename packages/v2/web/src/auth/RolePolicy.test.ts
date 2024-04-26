import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { statusCodes } from "@/statusCodes";
import { HttpServer } from "@/server/HttpServer";
import { EndpointResponse } from "@/server/Endpoint";
import { testHttpServer } from "@/test";
import { Claims } from "@/auth";
import { JwtSigner, jwtPolicy } from "@/jwt";
import { rolePolicy } from "./RolePolicy";

describe("RolePolicy", () => {
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
  const readerRolePolicy = rolePolicy(readerRole);

  let server: HttpServer;

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
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${readerToken}`),
    });

    expect(response.status).toBe(statusCodes.forbidden);
  });

  // it("should be authorized by jwt policy at global level", async () => {
  //   await server
  //     .useAuthentication(myJwtPolicy)
  //     .useEndpoint("get", "/", ({ user }) => {
  //       expect(user.authenticated).toBe(true);
  //       expect(user.claims.toPlain()).toMatchObject(adminClaims.toPlain());
  //       return new EndpointResponse({ status: statusCodes.ok });
  //     })
  //     .start();

  //   const response = await client.get(`http://localhost:${server.port}`, {
  //     headers: new HttpHeaders().add("authorization", `Bearer ${adminToken}`),
  //   });

  //   expect(response.ok).toBe(true);
  // });

  // it("should be denied by jwt policy at endpoint level", async () => {
  //   let counter = 0;

  //   await server
  //     .useEndpoint(
  //       "get",
  //       "/",
  //       () => {
  //         counter += 1; // this should not be reached!
  //         return new EndpointResponse({ status: statusCodes.ok });
  //       },
  //       {
  //         authentication: myJwtPolicy,
  //       }
  //     )
  //     .start();

  //   const response = await client.get(`http://localhost:${server.port}`);

  //   expect(response.status).toBe(statusCodes.unauthorized);

  //   expect(counter).toBe(0);
  // });

  // it("should be authorized by jwt policy at endpoint level", async () => {
  //   let counter = 0;

  //   await server
  //     .useEndpoint(
  //       "get",
  //       "/",
  //       ({ user }) => {
  //         expect(user.authenticated).toBe(true);
  //         expect(user.claims.toPlain()).toMatchObject(adminClaims.toPlain());
  //         counter += 1;
  //         return new EndpointResponse({ status: statusCodes.ok });
  //       },
  //       {
  //         authentication: myJwtPolicy,
  //       }
  //     )
  //     .start();

  //   const response = await client.get(`http://localhost:${server.port}`, {
  //     headers: new HttpHeaders().add("authorization", `Bearer ${adminToken}`),
  //   });

  //   expect(response.status).toBe(statusCodes.ok);

  //   expect(counter).toBe(1);
  // });
});
