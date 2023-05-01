import { Request, Response } from "express";
import { HttpContext } from "./HttpContext";
import { HttpContextBinder } from "./HttpContextBinder";
import { UserContext } from "./UserContext";
import { Container, NotImplementedError } from "@tomasjs/core";

export abstract class HttpContextResolver {
  private constructor() {}

  private static get container(): Container {
    throw new NotImplementedError("get container"); // TODO Implement
  }

  static fromExpress(req: Request, res: Response): HttpContext {
    // console.log("fromExpress");

    try {
      const context = this.container.get(HttpContext);
      // console.log("after resolving context");

      HttpContextBinder.fromExpress(context, req, res);
      // console.log("after HttpContextBinder");

      context.user = this.container.get(UserContext);

      return context;
    } catch (err) {
      // console.log("err", err);
      throw err;
    }
  }
}
