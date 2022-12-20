import { internalContainer } from "@/container";
import { Request, Response } from "express";
import { HttpContext } from "./HttpContext";
import { HttpContextBinder } from "./HttpContextBinder";

export abstract class HttpContextResolver {
  static fromExpress(req: Request, res: Response): HttpContext {
    const context = internalContainer.get(HttpContext);
    HttpContextBinder.fromExpress(context, req, res);
    return context;
  }
}
