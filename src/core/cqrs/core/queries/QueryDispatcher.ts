import { container, injectable } from "tsyringe";
import { AsyncQueryHandler } from "./AsyncQueryHandler";
import { Query } from "./Query";
import { QueryHandler } from "./QueryHandler";

@injectable()
export class QueryDispatcher {
  dispatch<TQuery extends Query<TResult>, TResult>(query: TQuery): TResult {
    const queryHandlerClassName = `${query.constructor.name}Handler`;
    const queryHandler = container.resolve(queryHandlerClassName) as QueryHandler<TQuery, TResult>;
    return queryHandler.handle(query);
  }

  dispatchAsync<TResult, TQuery extends Query<TResult> = Query<TResult>>(
    query: TQuery
  ): Promise<TResult> {
    const queryHandlerClassName = `${query.constructor.name}Handler`;
    const queryHandler = container.resolve(queryHandlerClassName) as AsyncQueryHandler<
      TResult,
      TQuery
    >;
    return queryHandler.handleAsync(query);
  }
}
