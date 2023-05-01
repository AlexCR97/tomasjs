import "reflect-metadata";
import "express-async-errors";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import fetch from "node-fetch";
import { AppBuilder } from "../builder";
import { HttpContext, statusCodes } from "../core";
import { endpoint, Endpoint, middleware, path } from "../endpoints";
import { FluentValidationMiddleware } from "./FluentValidationMiddleware";
import { FluentValidationSetup } from "./FluentValidationSetup";
import { inValidator } from "./@inValidator";
import { OkResponse } from "../responses/status-codes";
import { Validator } from "fluentvalidation-ts";
import { ContainerBuilder, injectable } from "@tomasjs/core";
import { tick, tryCloseServerAsync } from "../tests/utils";

describe("fluentvalidation-middleware", () => {
  const port = 3039;
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

  it(`The ${FluentValidationMiddleware.name} should return a "400 bad request" response when passed an invalid body`, async () => {
    // Arrange
    interface SignUpRequest {
      email: string;
      password: string;
    }

    class SignUpValidator extends Validator<SignUpRequest> {
      constructor() {
        super();
        this.ruleFor("email").emailAddress();
        this.ruleFor("password").minLength(6);
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint("post")
    //@ts-ignore: Fix decorators not working in test files
    @path("sign-up")
    //@ts-ignore: Fix decorators not working in test files
    @middleware(new FluentValidationMiddleware<SignUpRequest>(new SignUpValidator()))
    class SignUpEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useJson().useEndpoint(SignUpEndpoint).buildAsync(port);

    // Act/Assert
    const body: SignUpRequest = {
      email: "",
      password: "",
    };

    const response = await fetch(`${serverAddress}/sign-up`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(statusCodes.badRequest);
  });

  it(`The ${FluentValidationMiddleware.name} should return a "200 ok" response when passed a valid body`, async () => {
    // Arrange

    interface SignUpRequest {
      email: string;
      password: string;
    }

    class SignUpValidator extends Validator<SignUpRequest> {
      constructor() {
        super();
        this.ruleFor("email").emailAddress();
        this.ruleFor("password").minLength(6);
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint("post")
    //@ts-ignore: Fix decorators not working in test files
    @path("sign-up")
    //@ts-ignore: Fix decorators not working in test files
    @middleware(new FluentValidationMiddleware<SignUpRequest>(new SignUpValidator()))
    class SignUpEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useJson().useEndpoint(SignUpEndpoint).buildAsync(port);

    // Act/Assert
    const body: SignUpRequest = {
      email: "example@domain.com",
      password: "123456",
    };

    const response = await fetch(`${serverAddress}/sign-up`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(statusCodes.ok);
  });

  it(`A custom validator should be injectable`, async () => {
    // Arrange
    interface SignUpRequest {
      email: string;
      password: string;
    }

    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class SignUpValidator extends Validator<SignUpRequest> {
      constructor() {
        super();
        this.ruleFor("email").emailAddress();
        this.ruleFor("password").minLength(6);
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint("post")
    //@ts-ignore: Fix decorators not working in test files
    @path("sign-up")
    class SignUpEndpoint implements Endpoint {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
        @inValidator(SignUpValidator) private readonly validator: SignUpValidator
      ) {}
      handle(context: HttpContext) {
        this.validator.validate(context.request.body);
        return new OkResponse();
      }
    }

    await new ContainerBuilder()
      .setup(
        new FluentValidationSetup({
          validators: [SignUpValidator],
        })
      )
      .buildAsync();

    server = await new AppBuilder().useJson().useEndpoint(SignUpEndpoint).buildAsync(port);

    // Act/Assert
    const body: SignUpRequest = {
      email: "example@domain.com",
      password: "123456",
    };

    const response = await fetch(`${serverAddress}/sign-up`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(statusCodes.ok);
  });
});
