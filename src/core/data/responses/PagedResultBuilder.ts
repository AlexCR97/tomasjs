import { PagedResult } from "./PagedResult";

export class PagedResultBuilder<T> {
  private readonly pagedResult: PagedResult<T>;

  constructor() {
    this.pagedResult = new PagedResult<T>();
  }

  setData(data: T[]): PagedResultBuilder<T> {
    this.pagedResult.data = data;
    return this;
  }

  setTotalCount(totalCount: number): PagedResultBuilder<T> {
    this.pagedResult.totalCount = totalCount;
    return this;
  }

  build(): PagedResult<T> {
    return this.pagedResult;
  }
}
