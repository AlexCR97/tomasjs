import { Request, Response } from "express";
import { container } from "tsyringe";
import { HttpContext } from "./HttpContext";
import { HttpContextBinder } from "./HttpContextBinder";

export abstract class HttpContextResolver {
  static fromExpress(req: Request, res: Response): HttpContext {
    const context = container.resolve(HttpContext);
    console.log("HttpContextResolver.context", context);
    HttpContextBinder.fromExpress(context, req, res);
    return context;
  }
}
