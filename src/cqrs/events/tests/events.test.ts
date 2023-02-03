import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "@/tests/utils";
import { Endpoint, endpoint } from "@/endpoints";
import { HttpContext, StatusCodes } from "@/core";
import { inject } from "@/container";
import { AppBuilder } from "@/builder";
import { eventHandler } from "../@eventHandler";
import { EventHandler } from "../EventHandler";
import { EventDispatcher } from "../EventDispatcher";

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

    @eventHandler(UserCreatedEvent)
    class UserCreatedEventHandler implements EventHandler<UserCreatedEvent> {
      handle(event: UserCreatedEvent): void | Promise<void> {
        console.log("Event received!", event);
      }
    }

    @endpoint("post")
    class CreateUserEndpoint implements Endpoint {
      constructor(@inject(EventDispatcher) private readonly events: EventDispatcher) {}

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
    expect(response.status).toEqual(StatusCodes.ok);
  });
});
