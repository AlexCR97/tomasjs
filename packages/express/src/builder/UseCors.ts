import cors, { CorsOptions } from "cors";
import { AppSetupFactory } from "./AppSetupFactory";
import { AppSetupFunction } from "./AppSetupFunction";

export type UseCorsOptions = CorsOptions;

export class UseCors implements AppSetupFactory {
  constructor(private readonly options?: UseCorsOptions) {}

  create(): AppSetupFunction {
    return (app) => {
      app.use(cors(this.options));
    };
  }
}
