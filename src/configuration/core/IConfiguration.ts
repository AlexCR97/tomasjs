export interface IConfiguration<T extends object> {
  get root(): T;
}
