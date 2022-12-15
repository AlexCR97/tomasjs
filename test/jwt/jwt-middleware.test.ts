import "reflect-metadata";
import "express-async-errors";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder } from "../../src/builder";
import { tick } from "../utils/time";
import { HttpContext, StatusCodes } from "../../src/core";
import fetch from "node-fetch";
import { AnonymousEndpoint } from "../../src/endpoints";
import { JwtSigner } from "../../src/jwt";
import { JwtMiddleware } from "../../src/jwt/middleware";
import { OkResponse } from "../../src/responses/status-codes";
import { UserContext } from "../../dist/core";
import { JsonResponse } from "../../src/responses";

describe("jwt-middleware", () => {
  const port = 3037;
  const serverAddress = `http://localhost:${port}`;
  const serverTeardownOffsetMilliseconds = 50;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  it(`The ${JwtMiddleware.name} should return a "401 unauthorized" response if the "authorization" header is not provided`, async () => {
    // Arrange
    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useMiddleware(
        new JwtMiddleware({
          secret: secret,
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          return new OkResponse();
        })
      )
      .buildAsync(port);

    // Act/Assert
    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(StatusCodes.unauthorized);
  });

  it(`The ${JwtMiddleware.name} should return a "401 unauthorized" response if the bearer token is not provided in the "authorization"`, async () => {
    // Arrange
    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useMiddleware(
        new JwtMiddleware({
          secret: secret,
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          return new OkResponse();
        })
      )
      .buildAsync(port);

    // Act/Assert
    const response = await fetch(`${serverAddress}`, {
      headers: {
        authorization: "Bearer",
      },
    });
    expect(response.status).toBe(StatusCodes.unauthorized);
  });

  it(`The ${JwtMiddleware.name} should return a "401 unauthorized" response if the bearer token is invalid`, async () => {
    // Arrange
    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useMiddleware(
        new JwtMiddleware({
          secret: secret,
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          return new OkResponse();
        })
      )
      .buildAsync(port);

    // Act/Assert
    const response = await fetch(`${serverAddress}`, {
      headers: {
        authorization: "Bearer someInvalidAccessToken",
      },
    });
    expect(response.status).toBe(StatusCodes.unauthorized);
  });

  it(`The ${JwtMiddleware.name} should return a "401 unauthorized" response if the bearer token is expired`, async () => {
    // Arrange
    const claims = {
      userId: 1,
      exp: Math.floor(Date.now() / 1000), // A past expiration
    };
    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useMiddleware(
        new JwtMiddleware({
          secret: secret,
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          return new OkResponse();
        })
      )
      .buildAsync(port);

    // Act/Assert
    const accessToken = JwtSigner.sign(claims, secret);

    const response = await fetch(`${serverAddress}`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    expect(response.status).toBe(StatusCodes.unauthorized);
  });

  it(`The ${JwtMiddleware.name} should return a "200 ok" response if the bearer token is valid`, async () => {
    // Arrange
    const claims = { userId: 1 };
    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useMiddleware(
        new JwtMiddleware({
          secret: secret,
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          return new OkResponse();
        })
      )
      .buildAsync(port);

    // Act/Assert
    const accessToken = JwtSigner.sign(claims, secret);

    const response = await fetch(`${serverAddress}`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    expect(response.status).toBe(StatusCodes.ok);
  });

  it(`The ${JwtMiddleware.name} should set the "${UserContext.name}" in the "${HttpContext.name}"`, async () => {
    // Arrange
    interface UserClaims {
      userId: number;
      username: string;
    }

    const claims: UserClaims = {
      userId: 1,
      username: "@cool_username",
    };

    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useMiddleware(
        new JwtMiddleware({
          secret: secret,
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          return new JsonResponse(context.user?.claims);
        })
      )
      .buildAsync(port);

    const accessToken = JwtSigner.sign(claims, secret);

    // Act/Assert

    const response = await fetch(`${serverAddress}`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    expect(response.status).toBe(StatusCodes.ok);

    const responseJson: UserClaims = await response.json();
    expect(responseJson.userId).toBe(claims.userId);
    expect(responseJson.username).toEqual(claims.username);
  });
});
