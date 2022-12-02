import { Controller } from "@/@thomas/controllers";
import { AnonymousMiddleware, Middleware } from "@/@thomas/middleware";
import { RequestContext } from "@/@thomas/requests";
import { JsonResponse, PlainTextResponse } from "@/@thomas/responses";
import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { SampleOnBeforeMiddleware } from "../httpx/middleware";

@injectable()
export class SampleController extends Controller {
  route = "sample";

  constructor() {
    super();

    this.onBefore((req, res, next) => {
      console.log("onBefore with handler");
      next();
    });

    this.onBefore(async (req, res, next) => {
      console.log("onBefore with async handler");
      next();
    });

    this.onBefore(new AnonymousMiddleware((req, res, next) => {
      console.log(`onBefore with ${AnonymousMiddleware.name}`);
      next()
    }));

    this.onBefore(SampleOnBeforeMiddleware)

    this.get("/", (context: RequestContext) => {
      return new PlainTextResponse("Hello, ThomasJS!");
    });

    this.post("/", (context: RequestContext) => {
      const username = context.body.name;
      return new JsonResponse({ message: `Hello, ${username}!` });
    });

    this.onAfter((req, res, next) => {
      console.log("on after 1!");
      next()
    })
  }
}

@injectable()
export class OnBeforeMiddleware extends Middleware {
  handle(req: Request, res: Response, next: NextFunction): void {
    console.log(`onBefore with ${OnBeforeMiddleware.name} instance`);
    next();
  }
}
