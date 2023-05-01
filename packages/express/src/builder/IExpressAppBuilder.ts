import { Server } from "http";
import { AppSetupType } from "./AppSetupType";

export interface IExpressAppBuilder {
  use(setup: AppSetupType): IExpressAppBuilder;
  buildAsync(): Promise<Server>;
}
