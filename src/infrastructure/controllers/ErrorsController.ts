import { BaseController } from "@/@thomas/controllers";
import { DomainError, StatusCodeError } from "@/core/errors";
import { Request, Response } from "express";

export class ErrorsController extends BaseController {
  route = "errors";

  constructor() {
    super();

    this.get("/error", (req: Request, res: Response) => {
      throw new Error("This is an error");
    });

    this.get("/error/async", async (req: Request, res: Response) => {
      throw new Error("This is an async error");
    });

    this.get("/domainError", (req: Request, res: Response) => {
      throw new DomainError("domain_error", "This is a DomainError", {
        key: "someKey",
        value: "someValue",
      });
    });

    this.get("/domainError/async", async (req: Request, res: Response) => {
      throw new DomainError("async_domain_error", "This is an async DomainError", {
        key: "someKey",
        value: "someValue",
      });
    });

    this.get("/statusCodeError", (req: Request, res: Response) => {
      throw new StatusCodeError(400, "status_code_error", "This is a StatusCodeError", {
        key: "someKey",
        value: "someValue",
      });
    });

    this.get("/statusCodeError/async", (req: Request, res: Response) => {
      throw new StatusCodeError(
        400,
        "async_status_code_error",
        "This is an async StatusCodeError",
        {
          key: "someKey",
          value: "someValue",
        }
      );
    });
  }
}
