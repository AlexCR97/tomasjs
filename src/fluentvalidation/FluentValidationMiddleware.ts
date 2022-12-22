import { ClassConstructor, singleton } from "@/container";
import { HttpContext, StatusCodes } from "@/core";
import { Middleware } from "@/middleware";
import { JsonResponse } from "@/responses";
import { BadRequestResponse } from "@/responses/status-codes";
import { NextFunction } from "express";
import { Validator } from "fluentvalidation-ts";
import { ValidatorAdapter } from "./ValidatorAdapter";

@singleton()
export class FluentValidationMiddleware<
  TModel extends object,
  TValidator extends Validator<TModel> = Validator<TModel>
> extends Middleware {
  constructor(private validator: TValidator | ClassConstructor<TValidator>) {
    super();
  }
  handle(context: HttpContext, next: NextFunction): void | Promise<void> {
    const validator: TValidator =
      this.validator instanceof Validator
        ? this.validator
        : ValidatorAdapter.from<TModel, TValidator>(this.validator);

    const body = context.request.body;

    if (body === undefined || body === null) {
      return context.respond(new BadRequestResponse());
    }

    const results = validator.validate(body);

    if (results === undefined || results === null || Object.keys(results).length === 0) {
      return next();
    }

    return context.respond(
      new JsonResponse(results, {
        status: StatusCodes.badRequest,
      })
    );
  }
}
