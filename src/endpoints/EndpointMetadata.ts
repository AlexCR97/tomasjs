import { HttpMethod } from "@/core";
import { Endpoint } from "./Endpoint";

export class EndpointMetadata<TEndpoint extends Endpoint = Endpoint> {
  constructor(private readonly endpoint: TEndpoint) {}

  /* #region HTTP Method */

  private readonly httpMethodKey = "__endpoint__httpMethod";
  get httpMethod(): HttpMethod | undefined {
    return this.obj[this.httpMethodKey];
  }
  set httpMethod(value: HttpMethod | undefined) {
    this.obj[this.httpMethodKey] = value;
  }

  get httpMethodOrDefault(): HttpMethod {
    return this.httpMethod ?? "get";
  }

  /* #endregion */

  /* #region Path */

  private readonly pathKey = "__endpoint__path";
  get path(): string | undefined {
    return this.obj[this.pathKey];
  }
  set path(value: string | undefined) {
    this.obj[this.pathKey] = value;
  }

  /* #endregion */

  private get obj(): any {
    return this.endpoint;
  }
}
