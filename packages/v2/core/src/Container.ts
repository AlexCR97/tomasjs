export class Container {
  add(token: string, instance: any, scope: any): Container;
  add(...args: any[]): Container {
    return this;
  }
}
