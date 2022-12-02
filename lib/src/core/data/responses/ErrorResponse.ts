import { DomainError, StatusCodeError } from "@/core/errors";

// TODO Use mapper for this?

export class ErrorResponse<TDetails = any> {
  status!: number;
  code!: string;
  message!: string;
  source?: string;
  stackTrace?: string;
  details?: TDetails;

  private constructor() {}

  static fromError(err: Error) {
    const response = new ErrorResponse();
    response.status = 500;
    response.code = "unknown";
    response.message = err.message;
    response.source = err.name;
    response.stackTrace = err.stack;
    return response;
  }

  static fromDomainError(err: DomainError): ErrorResponse {
    const response = this.fromError(err);
    response.status = 500;
    response.code = err.code;
    response.details = err.details;
    return response;
  }

  static fromStatusCodeError(err: StatusCodeError): ErrorResponse {
    const response = this.fromDomainError(err);
    response.status = err.status;
    return response;
  }
}
