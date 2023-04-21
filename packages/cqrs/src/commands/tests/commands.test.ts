import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { CommandHandler } from "../CommandHandler";
import { commandHandler } from "../@commandHandler";
import { CommandDispatcher } from "../CommandDispatcher";
import { tryCloseServerAsync } from "../../../tests/utils";
import { Endpoint, endpoint } from "../../../endpoints";
import { inject } from "@tomasjs/core";
import { HttpContext, statusCodes } from "../../../core";
import { AppBuilder } from "../../../builder";

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

    //@ts-ignore: Fix decorators not working in test files
    @commandHandler(CreateUserCommand)
    class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, string> {
      execute(command: CreateUserCommand): string {
        return command.username;
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint("post")
    class CreateUserEndpoint implements Endpoint {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
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
    expect(response.status).toEqual(statusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedUsername);
  });
});
