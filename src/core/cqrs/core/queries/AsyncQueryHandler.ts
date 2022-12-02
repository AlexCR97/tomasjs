import { Query } from "./Query";

export abstract class AsyncQueryHandler<TResult, TQuery extends Query<TResult>> {
  abstract handleAsync(query: TQuery): Promise<TResult>;
}
