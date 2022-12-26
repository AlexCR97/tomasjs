import { HttpContext } from "@/core";
import { Request, Response } from "express";
import { GuardContext } from "./GuardContext";

export abstract class GuardContextFactory {
  private constructor() {}

  static fromExpress(req: Request, res: Response): GuardContext {
    const context = new GuardContext();
    Reflect.set(context, "request", req);
    Reflect.set(context, "response", res);
    return context;
  }

  static fromHttpContext(httpContext: HttpContext): GuardContext {
    const context = new GuardContext();
    Reflect.set(context, "request", httpContext.request);
    Reflect.set(context, "response", httpContext.respond);
    Reflect.set(context, "user", httpContext.user);
    return context;
  }
}
