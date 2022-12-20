import { Endpoint } from "@/endpoints";

export class EndpointMetadata<TEndpoint extends Endpoint> {
  constructor(private readonly endpoint: TEndpoint) {}
}
