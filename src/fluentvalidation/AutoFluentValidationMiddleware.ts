import { HttpContext } from "@/core";
import { Middleware } from "@/middleware";
import { NextFunction } from "express";
import { Validator } from "fluentvalidation-ts";
import { container } from "tsyringe";
import { FluentValidationSetup } from "./FluentValidationSetup";

export class AutoFluentValidationMiddleware extends Middleware {
  constructor() {
    super();
  }
  handle(context: HttpContext, next: NextFunction): void | Promise<void> {
    const body = context.request.body;
    console.log("body", body);
    console.log("registeredTokens", FluentValidationSetup.registeredTokens);

    for (const token of FluentValidationSetup.registeredTokens) {
      const validator = container.resolve<Validator<any>>(token);
      console.log("validator", validator);
    }

    next();
    // const validator: TValidator =
    //   this.validator instanceof Validator
    //     ? this.validator
    //     : ValidatorAdapter.from<TModel, TValidator>(this.validator);

    // const body = context.request.body;

    // if (body === undefined || body === null) {
    //   return context.respond(new BadRequestResponse());
    // }

    // const results = validator.validate(body);
    // console.log("results", results);

    // if (results === undefined || results === null || Object.keys(results).length === 0) {
    //   return next();
    // }

    // return context.respond(
    //   new JsonResponse(results, {
    //     status: StatusCodes.badRequest,
    //   })
    // );
  }
}
