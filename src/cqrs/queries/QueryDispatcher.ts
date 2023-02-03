import { ClassConstructor, internalContainer, singleton } from "@/container";
import { TomasError } from "@/core/errors";
import { getConstructorOf } from "@/core/internal";
import { QueryHandlerMetadata, QueryHandlerToken } from "./metadata";
import { QueryHandler } from "./QueryHandler";

@singleton()
export class QueryDispatcher {
  async fetch<TResult, TQuery = any>(query: TQuery): Promise<TResult> {
    const queryConstructor = getConstructorOf<TQuery>(query);
    const queryHandler = this.getQueryHandlerFor<TQuery, TResult>(queryConstructor);
    return await queryHandler.fetch(query);
  }

  private getQueryHandlerFor<TQuery, TResult>(
    queryConstructor: ClassConstructor<TQuery>
  ): QueryHandler<TQuery, TResult> {
    const queryHandlers =
      internalContainer.getAll<QueryHandler<TQuery, TResult>>(QueryHandlerToken);

    const matchingQueryHandler = queryHandlers.find((ch) => {
      const metadata = new QueryHandlerMetadata(ch);
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
