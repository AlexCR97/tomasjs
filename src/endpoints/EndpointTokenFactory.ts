import { constructor } from "tsyringe/dist/typings/types";

export abstract class EndpointTokenFactory {
  static readonly prefix = "endpoint";

  static create<T>(endpointClass: constructor<T>): string {
    return `${this.prefix}_${endpointClass.name}`;
  }
}
