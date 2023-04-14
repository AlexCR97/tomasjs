import { AnonymousEndpoint } from "../AnonymousEndpoint";
import { EndpointMetadata } from "./EndpointMetadata";

/**
 * Uses reflect-metadata to define a set of
 * accessors for an AnonymousEndpoint instance.
 */
export class AnonymousEndpointMetadata extends EndpointMetadata {
  constructor(private readonly endpoint: AnonymousEndpoint) {
    super();
  }

  protected override setMetadata(key: string, value: any): void {
    Reflect.set(this.endpoint, key, value);
  }

  protected override getMetadata<T>(key: string): T {
    return Reflect.get(this.endpoint, key);
  }
}
