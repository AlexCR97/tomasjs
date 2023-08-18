// import "reflect-metadata";
// import "express-async-errors";
// import fetch from "node-fetch";
// import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
// import { JwtGuard } from "./JwtGuard";
// import { JwtSigner } from "./JwtSigner";
// import { AppBuilder } from "../../builder";
// import { HttpContext, statusCodes, UserContext } from "../../core";
// import { AnonymousEndpoint } from "../../endpoints";
// import { JsonResponse } from "../../responses";
// import { OkResponse } from "../../responses/status-codes";
// import { tick, tryCloseServerAsync } from "../../tests/utils";

// describe("auth-jwt-guard", () => {
//   const port = 3037;
//   const serverAddress = `http://localhost:${port}`;
//   const serverTeardownOffsetMilliseconds = 0;
//   let server: any; // TODO Set http.Server type

//   beforeEach(async () => {
//     await tick(serverTeardownOffsetMilliseconds);
//     await tryCloseServerAsync(server);
//   });

//   afterEach(async () => {
//     await tick(serverTeardownOffsetMilliseconds);
//     await tryCloseServerAsync(server);
//   });

//   it(`The ${JwtGuard.name} should return a "401 unauthorized" response if the "authorization" header is not provided`, async () => {
//     // Arrange
//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useEndpoint(
//         new AnonymousEndpoint("get", "/", (context: HttpContext) => {
//           return new OkResponse();
//         })
//       )
//       .buildAsync(port);

//     // Act/Assert
//     const response = await fetch(`${serverAddress}`);
//     expect(response.status).toBe(statusCodes.unauthorized);
//   });

//   it(`The ${JwtGuard.name} should return a "401 unauthorized" response if the bearer token is not provided in the "authorization"`, async () => {
//     // Arrange
//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useEndpoint(
//         new AnonymousEndpoint("get", "/", (context: HttpContext) => {
//           return new OkResponse();
//         })
//       )
//       .buildAsync(port);

//     // Act/Assert
//     const response = await fetch(`${serverAddress}`, {
//       headers: {
//         authorization: "Bearer",
//       },
//     });
//     expect(response.status).toBe(statusCodes.unauthorized);
//   });

//   it(`The ${JwtGuard.name} should return a "401 unauthorized" response if the bearer token is invalid`, async () => {
//     // Arrange
//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useEndpoint(
//         new AnonymousEndpoint("get", "/", (context: HttpContext) => {
//           return new OkResponse();
//         })
//       )
//       .buildAsync(port);

//     // Act/Assert
//     const response = await fetch(`${serverAddress}`, {
//       headers: {
//         authorization: "Bearer someInvalidAccessToken",
//       },
//     });
//     expect(response.status).toBe(statusCodes.unauthorized);
//   });

//   it(`The ${JwtGuard.name} should return a "401 unauthorized" response if the bearer token is expired`, async () => {
//     // Arrange
//     const claims = {
//       userId: 1,
//       exp: Math.floor(Date.now() / 1000), // A past expiration
//     };
//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useEndpoint(
//         new AnonymousEndpoint("get", "/", (context: HttpContext) => {
//           return new OkResponse();
//         })
//       )
//       .buildAsync(port);

//     // Act/Assert
//     const accessToken = JwtSigner.sign(claims, secret);

//     const response = await fetch(`${serverAddress}`, {
//       headers: {
//         authorization: `Bearer ${accessToken}`,
//       },
//     });
//     expect(response.status).toBe(statusCodes.unauthorized);
//   });

//   it(`The ${JwtGuard.name} should return a "200 ok" response if the bearer token is valid`, async () => {
//     // Arrange
//     const claims = { userId: 1 };
//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useEndpoint(
//         new AnonymousEndpoint("get", "/", (context: HttpContext) => {
//           return new OkResponse();
//         })
//       )
//       .buildAsync(port);

//     // Act/Assert
//     const accessToken = JwtSigner.sign(claims, secret);

//     const response = await fetch(`${serverAddress}`, {
//       headers: {
//         authorization: `Bearer ${accessToken}`,
//       },
//     });
//     expect(response.status).toBe(statusCodes.ok);
//   });

//   it(`The ${JwtGuard.name} should set the "${UserContext.name}" in the "${HttpContext.name}"`, async () => {
//     // Arrange
//     interface UserClaims {
//       userId: number;
//       username: string;
//     }

//     const claims: UserClaims = {
//       userId: 1,
//       username: "@cool_username",
//     };

//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useEndpoint(
//         new AnonymousEndpoint("get", "/", (context: HttpContext) => {
//           return new JsonResponse(context.user?.claims);
//         })
//       )
//       .buildAsync(port);

//     const accessToken = JwtSigner.sign(claims, secret);

//     // Act/Assert

//     const response = await fetch(`${serverAddress}`, {
//       headers: {
//         authorization: `Bearer ${accessToken}`,
//       },
//     });
//     expect(response.status).toBe(statusCodes.ok);

//     const responseJson: UserClaims = await response.json();
//     expect(responseJson.userId).toBe(claims.userId);
//     expect(responseJson.username).toEqual(claims.username);
//   });
// });
