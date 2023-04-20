export interface QueryHandler<TQuery, TResult> {
  fetch(query: TQuery): TResult | Promise<TResult>;
}
