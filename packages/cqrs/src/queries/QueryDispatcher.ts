import {
  ClassConstructor,
  ServiceProvider,
  TomasError,
  getConstructorOf,
  inject,
  injectable,
  serviceProviderToken,
} from "@tomasjs/core";
import { QueryHandler } from "./QueryHandler";
import { QueryHandlerMetadata, QueryHandlerToken } from "./metadata";

@injectable()
export class QueryDispatcher {
  constructor(@inject(serviceProviderToken) private readonly services: ServiceProvider) {}

  async fetch<TResult, TQuery = any>(query: TQuery): Promise<TResult> {
    const queryConstructor = getConstructorOf<TQuery>(query);
    const queryHandler = this.getHandlerFor<TQuery, TResult>(queryConstructor);
    return await queryHandler.fetch(query);
  }

  private getHandlerFor<TQuery, TResult>(
    queryConstructor: ClassConstructor<TQuery>
  ): QueryHandler<TQuery, TResult> {
    const queryHandlers = this.services.getAll<QueryHandler<TQuery, TResult>>(QueryHandlerToken);

    const matchingQueryHandler = queryHandlers.find((qh) => {
      const metadata = new QueryHandlerMetadata(qh);
      return metadata.queryConstructor === queryConstructor;
    });

    if (!matchingQueryHandler) {
      throw new TomasError("Could not find a QueryHandler for the dispatched query.", {
        data: { queryConstructor: queryConstructor.name },
      });
    }

    return matchingQueryHandler;
  }
}
