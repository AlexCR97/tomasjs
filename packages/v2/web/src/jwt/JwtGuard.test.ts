import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { statusCodes } from "@/statusCodes";
import { JwtSigner } from "./JwtSigner";
import { Claims } from "@/auth";
import { jwtGuard } from "./JwtGuard";
import { HttpServer } from "@/server/HttpServer";
import { EndpointResponse } from "@/server/Endpoint";

describe("JwtGuard", () => {
  const client = new HttpClient();
  const secret = "foo bar fizz buzz";
  const claims: Claims = { foo: "bar", fizz: "buzz" } as const;
  const token = new JwtSigner({ secret }).sign(claims);
  const myJwtGuard = jwtGuard({ secret });

  it("should be denied by jwt guard", async () => {
    const port = 6060;

    const server = await new HttpServer({ port })
      .useGuard(myJwtGuard)
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${port}`);

    expect(response.status).toBe(statusCodes.unauthorized);

    await server.stop();
  });

  it("should be authorized by jwt guard", async () => {
    const port = 6061;

    const server = await new HttpServer({ port })
      .useGuard(myJwtGuard)
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${port}`, {
      headers: new HttpHeaders().add("authorization", `Bearer ${token}`),
    });

    expect(response.ok).toBe(true);

    await server.stop();
  });
});
