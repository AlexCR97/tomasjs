import { ClassConstructor } from "@/container";
import { Endpoint } from "./Endpoint";

export abstract class EndpointTokenFactory {
  static readonly prefix = "endpoint";

  static create<TEndpoint extends Endpoint>(constructor: ClassConstructor<TEndpoint>): string {
    return `${this.prefix}_${constructor.name}`;
  }
}
