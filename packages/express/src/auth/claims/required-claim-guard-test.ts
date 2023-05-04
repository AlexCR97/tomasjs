// import "reflect-metadata";
// import "express-async-errors";
// import fetch from "node-fetch";
// import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
// import { RequiredClaimGuard } from "./RequiredClaimGuard";
// import { JwtGuard, JwtSigner } from "../jwt";
// import { AppBuilder } from "../../builder";
// import { AnonymousEndpoint } from "../../endpoints";
// import { OkResponse } from "../../responses/status-codes";
// import { HttpContext, statusCodes } from "../../core";
// import { tick, tryCloseServerAsync } from "../../tests/utils";

// describe("auth-required-claim-guard", () => {
//   const port = 3038;
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

//   it(`The ${RequiredClaimGuard.name} should return a "403 forbidden" response if the ${JwtGuard.name} was not used first`, async () => {
//     // Arrange
//     const claimType = "role";

//     server = await new AppBuilder()
//       .useGuard(
//         new RequiredClaimGuard({
//           type: claimType,
//         })
//       )
//       .useEndpoint(
//         new AnonymousEndpoint("get", "/", (context: HttpContext) => {
//           return new OkResponse();
//         })
//       )
//       .buildAsync(port);

//     // Act/Assert
//     const response = await fetch(`${serverAddress}`);
//     expect(response.status).toBe(statusCodes.forbidden);
//   });

//   it(`The ${RequiredClaimGuard.name} should return a "403 forbidden" response if the user does not contain the required claim`, async () => {
//     // Arrange
//     const claimType = "role";
//     const claims: any = {};
//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useGuard(new RequiredClaimGuard({ type: claimType }))
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

//     expect(response.status).toBe(statusCodes.forbidden);
//   });

//   it(`The ${RequiredClaimGuard.name} should return a "200 ok" response if the user has the required claim`, async () => {
//     // Arrange
//     const claimType = "role";

//     const claims: any = {};
//     claims[claimType] = "SomeAuthorizedRole";

//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useGuard(new RequiredClaimGuard({ type: claimType }))
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

//   it(`The ${RequiredClaimGuard.name} should return a "403 forbidden" response if the user has the required claim but with an invalid value`, async () => {
//     // Arrange
//     const claimType = "role";
//     const claimValue = "SomeAuthorizedRole";

//     const claims: any = {};
//     claims[claimType] = "SomeUnauthorizedRole";

//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useGuard(
//         new RequiredClaimGuard({
//           type: claimType,
//           value: claimValue,
//         })
//       )
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

//     expect(response.status).toBe(statusCodes.forbidden);
//   });

//   it(`The ${RequiredClaimGuard.name} should return a "200 ok" response if the user has the required claim with a valid value`, async () => {
//     // Arrange
//     const claimType = "role";
//     const claimValue = "SomeAuthorizedRole";

//     const claims: any = {};
//     claims[claimType] = claimValue;

//     const secret = "SuperSecureSecretKey";

//     server = await new AppBuilder()
//       .useGuard(new JwtGuard({ secret }))
//       .useGuard(
//         new RequiredClaimGuard({
//           type: claimType,
//           value: claimValue,
//         })
//       )
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

//   it(`The ${RequiredClaimGuard.name} should protect an entire api section`, async () => {
//     // Arrange
//     const secret = "SuperSecureSecretKey";
//     const claimType = "role";

//     const teacherRole = "Teacher";
//     const teacherClaims: any = {};
//     teacherClaims[claimType] = teacherRole;
//     const teacherAccessToken = JwtSigner.sign(teacherClaims, secret);

//     const studentRole = "Student";
//     const studentClaims: any = {};
//     studentClaims[claimType] = studentRole;
//     const studentAccessToken = JwtSigner.sign(studentClaims, secret);

//     server = await new AppBuilder()
//       .useEndpointGroup((endpoints) =>
//         endpoints
//           .useBasePath("teachers")
//           .useGuard(new JwtGuard({ secret }))
//           .useGuard(
//             new RequiredClaimGuard({
//               type: claimType,
//               value: teacherRole,
//             })
//           )
//           .useEndpoint(
//             new AnonymousEndpoint("get", "/classrooms", (context: HttpContext) => {
//               return new OkResponse();
//             })
//           )
//           .useEndpoint(
//             new AnonymousEndpoint("get", "/students", (context: HttpContext) => {
//               return new OkResponse();
//             })
//           )
//       )
//       .useEndpointGroup((endpoints) =>
//         endpoints
//           .useBasePath("/students")
//           .useGuard(new JwtGuard({ secret }))
//           .useGuard(
//             new RequiredClaimGuard({
//               type: claimType,
//               value: studentRole,
//             })
//           )
//           .useEndpoint(
//             new AnonymousEndpoint("get", "/classrooms", (context: HttpContext) => {
//               return new OkResponse();
//             })
//           )
//           .useEndpoint(
//             new AnonymousEndpoint("get", "/grades", (context: HttpContext) => {
//               return new OkResponse();
//             })
//           )
//       )
//       .buildAsync(port);

//     // Act/Assert - Teacher API with Teacher role

//     await expectRequestToReturnStatusCodeAsync(
//       `${serverAddress}/teachers/classrooms`,
//       teacherAccessToken,
//       statusCodes.ok
//     );

//     await expectRequestToReturnStatusCodeAsync(
//       `${serverAddress}/teachers/students`,
//       teacherAccessToken,
//       statusCodes.ok
//     );

//     // Act/Assert - Student API with Student role

//     await expectRequestToReturnStatusCodeAsync(
//       `${serverAddress}/students/classrooms`,
//       studentAccessToken,
//       statusCodes.ok
//     );

//     await expectRequestToReturnStatusCodeAsync(
//       `${serverAddress}/students/grades`,
//       studentAccessToken,
//       statusCodes.ok
//     );

//     // Act/Assert - Teacher API with Student role

//     await expectRequestToReturnStatusCodeAsync(
//       `${serverAddress}/teachers/classrooms`,
//       studentAccessToken,
//       statusCodes.forbidden
//     );

//     await expectRequestToReturnStatusCodeAsync(
//       `${serverAddress}/teachers/students`,
//       studentAccessToken,
//       statusCodes.forbidden
//     );

//     // Act/Assert - Student API with Teacher role

//     await expectRequestToReturnStatusCodeAsync(
//       `${serverAddress}/students/classrooms`,
//       teacherAccessToken,
//       statusCodes.forbidden
//     );

//     await expectRequestToReturnStatusCodeAsync(
//       `${serverAddress}/students/grades`,
//       teacherAccessToken,
//       statusCodes.forbidden
//     );
//   });
// });

// async function expectRequestToReturnStatusCodeAsync(
//   url: string,
//   accessToken: string,
//   expectedStatus: number
// ) {
//   const response = await fetch(url, {
//     headers: {
//       authorization: `Bearer ${accessToken}`,
//     },
//   });

//   expect(response.status).toBe(expectedStatus);
// }
