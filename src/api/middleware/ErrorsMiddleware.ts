import { NextFunction, Request, Response } from "express";
import "express-async-errors";
import { ErrorResponse } from "@/core/data/responses/ErrorResponse";
import { DomainError, StatusCodeError } from "@/core/errors";

export function ErrorsMiddleware() {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    let errorResponse: ErrorResponse;

    if (err instanceof StatusCodeError) {
      errorResponse = ErrorResponse.fromStatusCodeError(err);
    } else if (err instanceof DomainError) {
      errorResponse = ErrorResponse.fromDomainError(err);
    } else {
      errorResponse = ErrorResponse.fromError(err);
    }

    res.status(errorResponse.status).json(errorResponse);
  };
}
