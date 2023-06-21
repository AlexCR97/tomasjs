import { statusCodes } from "@/core";
import { Middleware } from "@/middleware";
import { JsonResponse, ResponseAdapter } from "@/responses";
import { BadRequestResponse } from "@/responses/status-codes";
import { NextFunction, Request, Response } from "express";
import { Validator } from "fluentvalidation-ts";
import { ValidatorAdapter } from "./ValidatorAdapter";
import { ClassConstructor, injectable } from "@tomasjs/core";

@injectable()
export class FluentValidationMiddleware<
  TModel extends object,
  TValidator extends Validator<TModel> = Validator<TModel>
> implements Middleware
{
  constructor(private validator: TValidator | ClassConstructor<TValidator>) {}

  handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
    const validator: TValidator =
      this.validator instanceof Validator
        ? this.validator
        : ValidatorAdapter.from<TModel, TValidator>(this.validator);

    const body = req.body;

    if (body === undefined || body === null) {
      ResponseAdapter.fromThomasToExpress(res, new BadRequestResponse());
      return;
    }

    const results = validator.validate(body);

    if (results === undefined || results === null || Object.keys(results).length === 0) {
      return next();
    }

    ResponseAdapter.fromThomasToExpress(
      res,
      new JsonResponse(results, {
        status: statusCodes.badRequest,
      })
    );
  }
}
