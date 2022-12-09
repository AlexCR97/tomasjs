export interface IEndpoint {
  handle(...args: any[]): any | Promise<any>;
}
