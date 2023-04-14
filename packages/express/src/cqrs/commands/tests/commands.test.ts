import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "@/tests/utils";
import { CommandHandler } from "../CommandHandler";
import { commandHandler } from "../@commandHandler";
import { Endpoint, endpoint } from "@/endpoints";
import { HttpContext, StatusCodes } from "@/core";
import { inject } from "@/container";
import { CommandDispatcher } from "../CommandDispatcher";
import { AppBuilder } from "@/builder";

describe("cqrs-commands", () => {
  const port = 3042;
  const serverAddress = `http://localhost:${port}`;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it(`A CommandHandler works`, async () => {
    // Arrange
    const expectedUsername = "expectedUsername";

    class CreateUserCommand {
      constructor(readonly username: string) {}
    }

    @commandHandler(CreateUserCommand)
    class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, string> {
      execute(command: CreateUserCommand): string {
        return command.username;
      }
    }

    @endpoint("post")
    class CreateUserEndpoint implements Endpoint {
      constructor(
        @inject(CommandDispatcher) private readonly commandDispatcher: CommandDispatcher
      ) {}

      async handle({ request }: HttpContext) {
        return await this.commandDispatcher.execute<string>(
          new CreateUserCommand(request.body.username)
        );
      }
    }

    server = await new AppBuilder().useJson().useEndpoint(CreateUserEndpoint).buildAsync(port);

    // Act/Assert
    new CreateUserCommandHandler(); // Make ts happy

    const response = await fetch(serverAddress, {
      method: "post",
      body: JSON.stringify({ username: expectedUsername }),
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status).toEqual(StatusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedUsername);
  });
});
