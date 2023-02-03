import { internalContainer, singleton } from "@/container";
import { TomasError } from "@/core/errors";
import { QueryHandler } from "./QueryHandler";

@singleton()
export class QueryDispatcher {
  async fetch<TResult, TQuery = any>(query: TQuery): Promise<TResult> {
    const queryConstructorName = (query as any)?.constructor?.name;

    if (!queryConstructorName)
      throw new TomasError("The dispatched query is not a class instance", { data: { query } });

    const queryHandlerToken = `${queryConstructorName}Handler`;

    const queryHandler = internalContainer.get<QueryHandler<TQuery, TResult>>(queryHandlerToken);

    return await queryHandler.fetch(query);
  }
}
