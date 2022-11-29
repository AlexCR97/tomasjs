import { Query } from "./Query";

export abstract class QueryHandler<TQuery extends Query<TResult>, TResult> {
  abstract handle(query: TQuery): TResult;
}
