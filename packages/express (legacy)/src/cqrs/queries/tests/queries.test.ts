import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "@/tests/utils";
import { Endpoint, endpoint, path } from "@/endpoints";
import { HttpContext, StatusCodes } from "@/core";
import { inject } from "@/container";
import { AppBuilder } from "@/builder";
import { queryHandler } from "../@queryHandler";
import { QueryHandler } from "../QueryHandler";
import { QueryDispatcher } from "../QueryDispatcher";

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

    @queryHandler(GetUserQuery)
    class GetUserQueryHandler implements QueryHandler<GetUserQuery, string> {
      fetch(query: GetUserQuery): string {
        return query.username;
      }
    }

    @endpoint()
    @path(":username")
    class GetUserEndpoint implements Endpoint {
      constructor(@inject(QueryDispatcher) private readonly query: QueryDispatcher) {}

      async handle({ request }: HttpContext) {
        return await this.query.fetch<string>(new GetUserQuery(request.params.username));
      }
    }

    server = await new AppBuilder().useJson().useEndpoint(GetUserEndpoint).buildAsync(port);

    // Act/Assert
    new GetUserQueryHandler(); // Make ts happy

    const response = await fetch(`${serverAddress}/${expectedUsername}`);
    expect(response.status).toEqual(StatusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedUsername);
  });
});
