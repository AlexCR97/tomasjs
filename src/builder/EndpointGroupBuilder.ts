import { Router } from "express";
import { AbstractApiBuilder } from "./AbstractApiBuilder";

export interface IEndpointGroupBuilder extends AbstractApiBuilder<IEndpointGroupBuilder> {
  useBasePath(path: string): IEndpointGroupBuilder;
  build(): Router;
}

export class EndpointGroupBuilder
  extends AbstractApiBuilder<IEndpointGroupBuilder>
  implements IEndpointGroupBuilder
{
  protected override root = Router();

  /* #region Base Path */

  _basePath?: string; // TODO Mark as private?

  useBasePath(path: string): IEndpointGroupBuilder {
    this._basePath = path;
    return this;
  }

  /* #endregion */

  build(): Router {
    return this.tryBindMiddlewares().tryBindGuards().tryBindEndpoints().root;
  }
}
