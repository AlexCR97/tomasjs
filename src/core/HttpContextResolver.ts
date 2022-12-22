import { internalContainer } from "@/container";
import { Request, Response } from "express";
import { HttpContext } from "./HttpContext";
import { HttpContextBinder } from "./HttpContextBinder";

export abstract class HttpContextResolver {
  private constructor() {}

  static fromExpress(req: Request, res: Response): HttpContext {
    // console.log("fromExpress");

    try {
      const context = internalContainer.get(HttpContext);
      // console.log("after resolving context");

      HttpContextBinder.fromExpress(context, req, res);
      // console.log("after HttpContextBinder");

      return context;
    } catch (err) {
      throw err;
    }
  }
}
