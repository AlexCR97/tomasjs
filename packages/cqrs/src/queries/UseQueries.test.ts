import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { ServiceContainerBuilder, TomasError } from "@tomasjs/core";
import { queryHandler } from "./@queryHandler";
import { QueryDispatcher } from "./QueryDispatcher";
import { QueryHandler } from "./QueryHandler";
import { UseQueries } from "./UseQueries";
import { queryHandlerToken } from "./queryHandlerToken";

describe("queries-UseQueries", () => {
  it(`Can register the ${QueryDispatcher.name}`, async () => {
    const services = await new ServiceContainerBuilder()
      .setup(new UseQueries())
      .buildServiceProviderAsync();

    const queryDispatcher = services.get<QueryDispatcher>(QueryDispatcher);
    expect(queryDispatcher).toBeInstanceOf(QueryDispatcher);
  });

  it("Can register a QueryHandler", async () => {
    class TestQuery {}

    @queryHandler(TestQuery)
    class TestQueryHandler implements QueryHandler<TestQuery, void> {
      fetch(query: TestQuery) {}
    }

    const services = await new ServiceContainerBuilder()
      .setup(new UseQueries([TestQueryHandler]))
      .buildServiceProviderAsync();

    const queryHandlers = services.getAll<QueryHandler<any, any>>(queryHandlerToken);

    expect(queryHandlers.length).toBe(1);
    expect(queryHandlers[0]).toBeInstanceOf(TestQueryHandler);
  });

  it("Can register and use a QueryHandler", async () => {
    function meow(catName: string): string {
      return `${catName} says meow`;
    }

    class MeowQuery {
      constructor(readonly catName: string) {}
    }

    @queryHandler(MeowQuery)
    class MeowQueryHandler implements QueryHandler<MeowQuery, string> {
      fetch(query: MeowQuery): string {
        return meow(query.catName);
      }
    }

    const services = await new ServiceContainerBuilder()
      .setup(new UseQueries([MeowQueryHandler]))
      .buildServiceProviderAsync();

    const queryDispatcher = services.get<QueryDispatcher>(QueryDispatcher);
    const catName = "Tomas";
    const meowResult = await queryDispatcher.fetch<string>(new MeowQuery(catName));
    expect(meowResult).toEqual(meow(catName));
  });

  it("Can register and use multiple QueryHandlers", async () => {
    function meow(catName: string): string {
      return `${catName} says meow`;
    }

    class MeowQuery {
      constructor(readonly catName: string) {}
    }

    @queryHandler(MeowQuery)
    class MeowQueryHandler implements QueryHandler<MeowQuery, string> {
      fetch(query: MeowQuery): string {
        return meow(query.catName);
      }
    }

    function woof(dogName: string): string {
      return `${dogName} says woof`;
    }

    class WoofQuery {
      constructor(readonly dogName: string) {}
    }

    @queryHandler(WoofQuery)
    class WoofQueryHandler implements QueryHandler<WoofQuery, string> {
      fetch(query: WoofQuery): string | Promise<string> {
        return woof(query.dogName);
      }
    }

    const services = await new ServiceContainerBuilder()
      .setup(new UseQueries([MeowQueryHandler, WoofQueryHandler]))
      .buildServiceProviderAsync();

    const queryDispatcher = services.get<QueryDispatcher>(QueryDispatcher);

    const catName = "Tomas";
    const meowResult = await queryDispatcher.fetch<string>(new MeowQuery(catName));
    expect(meowResult).toEqual(meow(catName));

    const dogName = "Doki";
    const woofResult = await queryDispatcher.fetch<string>(new WoofQuery(dogName));
    expect(woofResult).toEqual(woof(dogName));
  });

  it("Should throw a detailed error when fetching and unknown query", async () => {
    class TestQuery {
      constructor() {}
    }

    const services = await new ServiceContainerBuilder()
      .setup(new UseQueries([]))
      .buildServiceProviderAsync();

    const queryDispatcher = services.get<QueryDispatcher>(QueryDispatcher);

    try {
      await queryDispatcher.fetch(new TestQuery());
      throw "The test should have thrown an error";
    } catch (err) {
      expect(err).toBeInstanceOf(TomasError);
    }
  });
});
