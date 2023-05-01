import { json } from "express";
import { AppSetupFunction } from "./AppSetupFunction";
import { AppSetupFactory } from "./AppSetupFactory";

type JsonParams = Parameters<typeof json>;

export type UseJsonOptions = JsonParams[0];

export class UseJson implements AppSetupFactory {
  constructor(private readonly options?: UseJsonOptions) {}

  create(): AppSetupFunction {
    return (app) => {
      app.use(json(this.options));
    };
  }
}
