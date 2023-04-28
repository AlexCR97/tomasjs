import { ClassConstructor, ServiceProvider, TomasError, getConstructorOf } from "@tomasjs/core";
import { QueryHandlerMetadata, QueryHandlerToken } from "./metadata";
import { QueryHandler } from "./QueryHandler";

export class QueryDispatcher {
  constructor(private readonly services: ServiceProvider) {}

  async fetch<TResult, TQuery = any>(query: TQuery): Promise<TResult> {
    const queryConstructor = getConstructorOf<TQuery>(query);
    const queryHandler = this.getQueryHandlerFor<TQuery, TResult>(queryConstructor);
    return await queryHandler.fetch(query);
  }

  private getQueryHandlerFor<TQuery, TResult>(
    queryConstructor: ClassConstructor<TQuery>
  ): QueryHandler<TQuery, TResult> {
    const queryHandlers = this.services.getAll<QueryHandler<TQuery, TResult>>(QueryHandlerToken);

    const matchingQueryHandler = queryHandlers.find((qh) => {
      const metadata = new QueryHandlerMetadata(qh);
      return metadata.queryConstructor === queryConstructor;
    });

    if (!matchingQueryHandler) {
      throw new TomasError("Could not find a QueryHandler for the dispatched query.", {
        data: { queryConstructor },
      });
    }

    return matchingQueryHandler;
  }
}
