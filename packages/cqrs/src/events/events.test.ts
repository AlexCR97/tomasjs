import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { inject } from "@tomasjs/core";
import { HttpContext, AppBuilder, statusCodes } from "@tomasjs/express";
import { Endpoint, endpoint } from "@tomasjs/express/endpoints";
import { eventHandler } from "./@eventHandler";
import { EventHandler } from "./EventHandler";
import { EventDispatcher } from "./EventDispatcher";
import { tryCloseServerAsync } from "../tests/utils";

describe("cqrs-events", () => {
  const port = 3044;
  const serverAddress = `http://localhost:${port}`;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it(`An EventHandler works`, async () => {
    // Arrange
    const expectedUsername = "expectedUsername";

    class UserCreatedEvent {
      constructor(readonly username: string) {}
    }

    //@ts-ignore: Fix decorators not working in test files
    @eventHandler(UserCreatedEvent)
    class UserCreatedEventHandler implements EventHandler<UserCreatedEvent> {
      handle(event: UserCreatedEvent): void | Promise<void> {
        console.log("Event received!", event);
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint("post")
    class CreateUserEndpoint implements Endpoint {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
        @inject(EventDispatcher) private readonly events: EventDispatcher
      ) {}

      async handle({ request }: HttpContext) {
        this.events.emit(new UserCreatedEvent(request.body.username));
      }
    }

    server = await new AppBuilder().useJson().useEndpoint(CreateUserEndpoint).buildAsync(port);

    // Act/Assert
    new UserCreatedEventHandler(); // Make ts happy

    const response = await fetch(serverAddress, {
      method: "post",
      body: JSON.stringify({ username: expectedUsername }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toEqual(statusCodes.ok);
  });
});