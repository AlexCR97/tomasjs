import { Request, Response } from "express";
import { HttpContext } from "./HttpContext";

export class HttpContextAdapter {
  constructor(readonly req: Request, readonly res: Response) {}

  adapt(): HttpContext {
    return new HttpContext(this.req, this.res, this.req.user);
  }
}
