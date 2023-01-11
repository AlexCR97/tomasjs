import { ClassConstructor, isClassConstructor } from "@/container";
import { TomasError } from "@/core/errors";
import { AnonymousEndpoint } from "../AnonymousEndpoint";
import { Endpoint } from "../Endpoint";
import { isEndpoint } from "../isEndpoint";
import { AnonymousEndpointMetadata } from "./AnonymousEndpointMetadata";
import { EndpointPrototypeMetadata } from "./EndpointPrototypeMetadata";
import { IEndpointMetadata } from "./IEndpointMetadata";

export abstract class EndpointMetadataStrategy {
  private constructor() {}

  static get<TEndpoint extends Endpoint = Endpoint>(
    endpoint: TEndpoint | ClassConstructor<TEndpoint>
  ): IEndpointMetadata {
    if (endpoint instanceof AnonymousEndpoint) {
      return new AnonymousEndpointMetadata(endpoint);
    }

    if (isEndpoint(endpoint) || isClassConstructor(endpoint)) {
      return new EndpointPrototypeMetadata(endpoint);
    }

    throw new TomasError(`Cannot resolve EndpointMetadata strategy for endpoint ${endpoint}`, {
      data: endpoint,
    });
  }
}
