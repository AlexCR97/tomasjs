export interface IRepository<T> {
  getAsync(): Promise<T[]>;
}
