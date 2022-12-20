import "reflect-metadata";
import "express-async-errors";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder, ContainerBuilder } from "../../src/builder";
import { tick } from "../utils/time";
import { injectable } from "../../src";
import { HttpContext, StatusCodes } from "../../src/core";
import fetch from "node-fetch";
import { Endpoint } from "../../src/endpoints";
import {
  FluentValidationMiddleware,
  FluentValidationSetup,
  inValidator,
} from "../../src/fluentvalidation";
import { Validator } from "fluentvalidation-ts";
import { OkResponse } from "../../src/responses/status-codes";

describe("fluentvalidation-middleware", () => {
  const port = 3039;
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

    class SignUpEndpoint extends Endpoint {
      constructor() {
        super();
        this.method("post").path("/sign-up");
        this.onBefore(new FluentValidationMiddleware<SignUpRequest>(new SignUpValidator()));
      }
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

    expect(response.status).toBe(StatusCodes.badRequest);
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

    class SignUpEndpoint extends Endpoint {
      constructor() {
        super();
        this.method("post").path("/sign-up");
        this.onBefore(new FluentValidationMiddleware<SignUpRequest>(new SignUpValidator()));
      }
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

    expect(response.status).toBe(StatusCodes.ok);
  });

  it(`A custom validator should be injectable`, async () => {
    // Arrange
    interface SignUpRequest {
      email: string;
      password: string;
    }

    @injectable()
    class SignUpValidator extends Validator<SignUpRequest> {
      constructor() {
        super();
        this.ruleFor("email").emailAddress();
        this.ruleFor("password").minLength(6);
      }
    }

    @injectable()
    class SignUpEndpoint extends Endpoint {
      constructor(@inValidator(SignUpValidator) private readonly validator: SignUpValidator) {
        super();
        this.method("post").path("/sign-up");
      }
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

    expect(response.status).toBe(StatusCodes.ok);
  });
});
