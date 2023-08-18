import { JsonResponse } from "./JsonResponse";
import { ProblemDetails } from "../core/ProblemDetails";

export class ProblemDetailsResponse extends JsonResponse {
  constructor(problemDetails: ProblemDetails) {
    super(problemDetails, { status: problemDetails.status });
  }
}
