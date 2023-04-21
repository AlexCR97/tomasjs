import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { queryHandler } from "../@queryHandler";
import { QueryHandler } from "../QueryHandler";
import { QueryDispatcher } from "../QueryDispatcher";
import { inject } from "@tomasjs/core";
import { AppBuilder } from "../../../builder";
import { HttpContext, statusCodes } from "../../../core";
import { endpoint, path, Endpoint } from "../../../endpoints";
import { tryCloseServerAsync } from "../../../tests/utils";

describe("cqrs-queries", () => {
  const port = 3043;
  const serverAddress = `http://localhost:${port}`;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it(`An QueryHandler works`, async () => {
    // Arrange
    const expectedUsername = "expectedUsername";

    class GetUserQuery {
      constructor(readonly username: string) {}
    }

    //@ts-ignore: Fix decorators not working in test files
    @queryHandler(GetUserQuery)
    class GetUserQueryHandler implements QueryHandler<GetUserQuery, string> {
      fetch(query: GetUserQuery): string {
        return query.username;
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    //@ts-ignore: Fix decorators not working in test files
    @path(":username")
    class GetUserEndpoint implements Endpoint {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
        @inject(QueryDispatcher) private readonly query: QueryDispatcher
      ) {}

      async handle({ request }: HttpContext) {
        return await this.query.fetch<string>(new GetUserQuery(request.params.username));
      }
    }

    server = await new AppBuilder().useJson().useEndpoint(GetUserEndpoint).buildAsync(port);

    // Act/Assert
    new GetUserQueryHandler(); // Make ts happy

    const response = await fetch(`${serverAddress}/${expectedUsername}`);
    expect(response.status).toEqual(statusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedUsername);
  });
});
