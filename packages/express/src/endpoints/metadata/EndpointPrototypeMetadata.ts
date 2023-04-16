import { ClassConstructor } from "@/container";
import { Endpoint } from "../Endpoint";
import { isEndpoint } from "../isEndpoint";
import { EndpointMetadata } from "./EndpointMetadata";

/**
 * Uses reflect-metadata to define a set of accessors for an
 * Endpoint constructor prototype or an Endpoint instance prototype.
 */
export class EndpointPrototypeMetadata<
  TEndpoint extends Endpoint = Endpoint
> extends EndpointMetadata {
  constructor(private readonly endpoint: TEndpoint | ClassConstructor<TEndpoint>) {
    super();
  }

  protected override setMetadata(key: string, value: any): void {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    Reflect.defineMetadata(key, value, this.endpointPrototype);
  }

  protected override getMetadata<T>(key: string): T {
    //@ts-ignore: The package "reflect-metadata" should be imported by host
    return Reflect.getMetadata(key, this.endpointPrototype);
  }

  private get endpointPrototype() {
    return isEndpoint(this.endpoint)
      ? Object.getPrototypeOf(this.endpoint)
      : this.endpoint.prototype;
  }
}
