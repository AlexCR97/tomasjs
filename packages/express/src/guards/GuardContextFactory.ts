import { Request, Response } from "express";
import { GuardContext } from "./GuardContext";

export abstract class GuardContextFactory {
  private constructor() {}

  static fromExpress(req: Request, res: Response): GuardContext {
    const context = new GuardContext();
    Reflect.set(context, "req", req);
    Reflect.set(context, "res", res);
    return context;
  }
}
