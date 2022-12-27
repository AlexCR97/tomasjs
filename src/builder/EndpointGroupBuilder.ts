import { Router } from "express";
import { AbstractApiBuilder } from "./AbstractApiBuilder";

export class EndpointGroupBuilder extends AbstractApiBuilder {
  protected override root = Router();

  /* #region Base Path */

  _basePath?: string; // TODO Mark as private?

  useBasePath(path: string): EndpointGroupBuilder {
    this._basePath = path;
    return this;
  }

  /* #endregion */

  build() {
    this.tryBindMiddlewares();
    this.tryBindGuards();
    this.tryBindEndpoints();
    return this.root;
  }
}
