import { Request, Response } from "express";
import { GuardContext } from "./GuardContext";

export class GuardContextFactory {
  constructor(private readonly req: Request, private readonly res: Response) {}

  create(): GuardContext {
    const context = new GuardContext();
    Reflect.set(context, "req", this.req);
    Reflect.set(context, "res", this.res);
    return context;
  }
}
