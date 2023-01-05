import "reflect-metadata";
import "express-async-errors";
import fetch from "node-fetch";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../../utils/server";
import { tick } from "../../utils/time";
import { RequiredClaimGuard } from "../../../src/auth/claims";
import { JwtGuard, JwtSigner } from "../../../src/auth/jwt";
import { AppBuilder } from "../../../src/builder";
import { HttpContext, StatusCodes } from "../../../src/core";
import { AnonymousEndpoint } from "../../../src/endpoints";
import { OkResponse } from "../../../src/responses/status-codes";

describe("auth-required-claim-guard", () => {
  const port = 3038;
  const serverAddress = `http://localhost:${port}`;
  const serverTeardownOffsetMilliseconds = 0;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  it(`The ${RequiredClaimGuard.name} should return a "403 forbidden" response if the ${JwtGuard.name} was not used first`, async () => {
    // Arrange
    const claimType = "role";

    server = await new AppBuilder()
      .useGuard(
        new RequiredClaimGuard({
          type: claimType,
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
    expect(response.status).toBe(StatusCodes.forbidden);
  });

  it(`The ${RequiredClaimGuard.name} should return a "403 forbidden" response if the user does not contain the required claim`, async () => {
    // Arrange
    const claimType = "role";
    const claims: any = {};
    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useGuard(new JwtGuard({ secret }))
      .useGuard(new RequiredClaimGuard({ type: claimType }))
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

    expect(response.status).toBe(StatusCodes.forbidden);
  });

  it(`The ${RequiredClaimGuard.name} should return a "200 ok" response if the user has the required claim`, async () => {
    // Arrange
    const claimType = "role";

    const claims: any = {};
    claims[claimType] = "SomeAuthorizedRole";

    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useGuard(new JwtGuard({ secret }))
      .useGuard(new RequiredClaimGuard({ type: claimType }))
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

  it(`The ${RequiredClaimGuard.name} should return a "403 forbidden" response if the user has the required claim but with an invalid value`, async () => {
    // Arrange
    const claimType = "role";
    const claimValue = "SomeAuthorizedRole";

    const claims: any = {};
    claims[claimType] = "SomeUnauthorizedRole";

    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useGuard(new JwtGuard({ secret }))
      .useGuard(
        new RequiredClaimGuard({
          type: claimType,
          value: claimValue,
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

    expect(response.status).toBe(StatusCodes.forbidden);
  });

  it(`The ${RequiredClaimGuard.name} should return a "200 ok" response if the user has the required claim with a valid value`, async () => {
    // Arrange
    const claimType = "role";
    const claimValue = "SomeAuthorizedRole";

    const claims: any = {};
    claims[claimType] = claimValue;

    const secret = "SuperSecureSecretKey";

    server = await new AppBuilder()
      .useGuard(new JwtGuard({ secret }))
      .useGuard(
        new RequiredClaimGuard({
          type: claimType,
          value: claimValue,
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

  it(`The ${RequiredClaimGuard.name} should protect an entire api section`, async () => {
    // Arrange
    const secret = "SuperSecureSecretKey";
    const claimType = "role";

    const teacherRole = "Teacher";
    const teacherClaims: any = {};
    teacherClaims[claimType] = teacherRole;
    const teacherAccessToken = JwtSigner.sign(teacherClaims, secret);

    const studentRole = "Student";
    const studentClaims: any = {};
    studentClaims[claimType] = studentRole;
    const studentAccessToken = JwtSigner.sign(studentClaims, secret);

    server = await new AppBuilder()
      .useEndpointGroup((endpoints) =>
        endpoints
          .useBasePath("teachers")
          .useGuard(new JwtGuard({ secret }))
          .useGuard(
            new RequiredClaimGuard({
              type: claimType,
              value: teacherRole,
            })
          )
          .useEndpoint(
            new AnonymousEndpoint("get", "/classrooms", (context: HttpContext) => {
              return new OkResponse();
            })
          )
          .useEndpoint(
            new AnonymousEndpoint("get", "/students", (context: HttpContext) => {
              return new OkResponse();
            })
          )
      )
      .useEndpointGroup((endpoints) =>
        endpoints
          .useBasePath("/students")
          .useGuard(new JwtGuard({ secret }))
          .useGuard(
            new RequiredClaimGuard({
              type: claimType,
              value: studentRole,
            })
          )
          .useEndpoint(
            new AnonymousEndpoint("get", "/classrooms", (context: HttpContext) => {
              return new OkResponse();
            })
          )
          .useEndpoint(
            new AnonymousEndpoint("get", "/grades", (context: HttpContext) => {
              return new OkResponse();
            })
          )
      )
      .buildAsync(port);

    // Act/Assert - Teacher API with Teacher role

    await expectRequestToReturnStatusCodeAsync(
      `${serverAddress}/teachers/classrooms`,
      teacherAccessToken,
      StatusCodes.ok
    );

    await expectRequestToReturnStatusCodeAsync(
      `${serverAddress}/teachers/students`,
      teacherAccessToken,
      StatusCodes.ok
    );

    // Act/Assert - Student API with Student role

    await expectRequestToReturnStatusCodeAsync(
      `${serverAddress}/students/classrooms`,
      studentAccessToken,
      StatusCodes.ok
    );

    await expectRequestToReturnStatusCodeAsync(
      `${serverAddress}/students/grades`,
      studentAccessToken,
      StatusCodes.ok
    );

    // Act/Assert - Teacher API with Student role

    await expectRequestToReturnStatusCodeAsync(
      `${serverAddress}/teachers/classrooms`,
      studentAccessToken,
      StatusCodes.forbidden
    );

    await expectRequestToReturnStatusCodeAsync(
      `${serverAddress}/teachers/students`,
      studentAccessToken,
      StatusCodes.forbidden
    );

    // Act/Assert - Student API with Teacher role

    await expectRequestToReturnStatusCodeAsync(
      `${serverAddress}/students/classrooms`,
      teacherAccessToken,
      StatusCodes.forbidden
    );

    await expectRequestToReturnStatusCodeAsync(
      `${serverAddress}/students/grades`,
      teacherAccessToken,
      StatusCodes.forbidden
    );
  });
});

async function expectRequestToReturnStatusCodeAsync(
  url: string,
  accessToken: string,
  expectedStatus: number
) {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  expect(response.status).toBe(expectedStatus);
}
