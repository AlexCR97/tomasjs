import { constructor } from "tsyringe/dist/typings/types";
import { Endpoint } from "./Endpoint";

export class EndpointGroup {
  /* #region Base Path */

  _basePath?: string;

  basePath(path: string): EndpointGroup {
    this._basePath = path;
    return this;
  }

  /* #endregion */

  /* #region Endpoints */

  readonly endpoints: (Endpoint | constructor<Endpoint>)[] = [];

  useEndpoint<TEndpoint extends Endpoint = Endpoint>(
    endpoint: TEndpoint | constructor<TEndpoint>
  ): EndpointGroup {
    this.endpoints.push(endpoint);
    return this;
  }

  /* #endregion */
}
