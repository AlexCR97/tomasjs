import { ProblemDetails } from "@/core";
import { TomasError } from "@tomasjs/core";

export class ProblemDetailsError extends TomasError {
  constructor(readonly problemDetails: ProblemDetails) {
    super(problemDetails.details ?? problemDetails.title);
  }
}
